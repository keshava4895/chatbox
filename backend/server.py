from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from fastapi.responses import StreamingResponse, Response
from fastapi.middleware.cors import CORSMiddleware

import hashlib
import json
import zipfile
import requests
import os
import io
import fitz
from azure.storage.blob import BlobServiceClient
from azure.core.exceptions import ResourceExistsError
from openai import AzureOpenAI
from dotenv import load_dotenv
from pathlib import Path
from PyPDF2 import PdfReader
from docx import Document


# ===================== LOAD ENV =====================

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

# ===================== CONFIG =====================

AZURE_BLOB_CONN       = os.getenv("BLOB_CONN")
CONTAINER_NAME        = os.getenv("BLOB_CONTAINER", "nikepocfiles")  # ✅ default to nikepocfiles

AZURE_SEARCH_ENDPOINT = os.getenv("SEARCH_ENDPOINT")
AZURE_SEARCH_KEY      = os.getenv("SEARCH_KEY")
INDEX_NAME            = os.getenv("INDEX_NAME", "nike-index")

AZURE_OPENAI_ENDPOINT = os.getenv("OPENAI_ENDPOINT")
AZURE_OPENAI_KEY      = os.getenv("OPENAI_KEY")

CHAT_MODEL            = os.getenv("CHAT_MODEL", "nike-gpt-4o")
EMBED_MODEL           = os.getenv("EMBED_MODEL", "nike-text-embedding-3-large")  # ✅ 3-large deployment

API_VERSION           = "2024-12-01-preview"

#3-large = 3072 dimensions
VECTOR_DIMENSIONS     = 3072

if not AZURE_OPENAI_KEY:
    raise ValueError("❌ OPENAI_KEY not set in .env")

if not AZURE_OPENAI_ENDPOINT:
    raise ValueError("❌ OPENAI_ENDPOINT not set in .env")

# ===================== CLIENTS =====================

client = AzureOpenAI(
    api_key=AZURE_OPENAI_KEY,
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    api_version=API_VERSION
)

blob_service = BlobServiceClient.from_connection_string(AZURE_BLOB_CONN)

# Ensure container exists on startup
try:
    container_client = blob_service.get_container_client(CONTAINER_NAME)
    container_client.get_container_properties()
    print(f"✅ Container '{CONTAINER_NAME}' exists")
except ResourceExistsError:
    print(f"✅ Container '{CONTAINER_NAME}' already exists")
except Exception as e:
    try:
        print(f"📦 Creating container '{CONTAINER_NAME}'...")
        blob_service.create_container(name=CONTAINER_NAME)
        print(f"✅ Container '{CONTAINER_NAME}' created successfully")
    except ResourceExistsError:
        print(f"✅ Container '{CONTAINER_NAME}' already exists")
    except Exception as create_error:
        print(f"⚠️ Warning: Could not ensure container exists: {create_error}")

# ===================== FASTAPI =====================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ===================== MODEL =====================

class Query(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User query message")

# ===================== FILE READING =====================

def read_file_bytes(filename: str, content: bytes) -> str:
    """Extract text from file bytes based on extension"""
    if filename.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(content))
        return "".join([p.extract_text() or "" for p in reader.pages])

    elif filename.endswith(".docx"):
        doc = Document(io.BytesIO(content))
        return "\n".join([p.text for p in doc.paragraphs])

    else:
        return content.decode("utf-8", errors="ignore")


def read_file(path: str) -> str:
    """Read text from a local file path"""
    with open(path, "rb") as f:
        return read_file_bytes(os.path.basename(path), f.read())

# ===================== CHUNKING =====================

def chunk_text(text: str, size: int = 400, overlap: int = 100):
    """Chunk text with overlap to preserve context across boundaries."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk)
        start += size - overlap
    return chunks

# ===================== EMBEDDING =====================

def get_embedding(text: str):
    """Call Azure OpenAI text-embedding-3-large. Returns 3072 floats."""
    response = client.embeddings.create(
        model=EMBED_MODEL,
        input=text
    )
    return response.data[0].embedding

# ===================== INDEX MANAGEMENT =====================

def create_index():
    """Delete and recreate nike-index with 3072 dimensions (text-embedding-3-large)."""
    index_schema = {
        "name": INDEX_NAME,
        "fields": [
            {
                "name": "id",
                "type": "Edm.String",
                "key": True,
                "searchable": True,
                "retrievable": True,
                "filterable": True,
                "sortable": True,
                "facetable": True
            },
            {
                "name": "content",
                "type": "Edm.String",
                "key": False,
                "searchable": True,
                "retrievable": True,
                "filterable": True,
                "sortable": False,
                "facetable": False
            },
            {
                "name": "file_name",
                "type": "Edm.String",
                "key": False,
                "searchable": True,
                "retrievable": True,
                "filterable": True,
                "sortable": True,
                "facetable": True
            },
            {
                "name": "contentVector",
                "type": "Collection(Edm.Single)",
                "searchable": True,
                "filterable": False,
                "sortable": False,
                "facetable": False,
                "retrievable": True,
                "dimensions": VECTOR_DIMENSIONS,  #3072 for text-embedding-3-large
                "vectorSearchProfile": "my-vector-profile"
            }
        ],
        "vectorSearch": {
            "profiles": [
                {
                    "name": "my-vector-profile",
                    "algorithm": "my-hnsw-config"
                }
            ],
            "algorithms": [
                {
                    "name": "my-hnsw-config",
                    "kind": "hnsw",
                    "hnswParameters": {
                        "m": 4,
                        "efConstruction": 400,
                        "efSearch": 500,
                        "metric": "cosine"
                    }
                }
            ]
        }
    }

    url = f"{AZURE_SEARCH_ENDPOINT}/indexes/{INDEX_NAME}?api-version=2024-07-01"
    headers = {"Content-Type": "application/json", "api-key": AZURE_SEARCH_KEY}

    del_res = requests.delete(url, headers=headers)
    print(f"Delete index: {del_res.status_code}")

    res = requests.put(url, headers=headers, json=index_schema)
    if res.status_code in [200, 201]:
        print(f"✅ Index created successfully with {VECTOR_DIMENSIONS} dimensions")
    else:
        print(f"❌ Index creation failed: {res.status_code} - {res.text}")

# ===================== ENSURE INDEX =====================

def ensure_index_exists():
    """Create the index only if it doesn't already exist."""
    url = f"{AZURE_SEARCH_ENDPOINT}/indexes/{INDEX_NAME}?api-version=2024-07-01"
    headers = {"api-key": AZURE_SEARCH_KEY}
    res = requests.get(url, headers=headers)
    if res.status_code == 404:
        print(f"Index '{INDEX_NAME}' not found — creating...")
        create_index()
    else:
        print(f"✅ Index '{INDEX_NAME}' already exists")

# ===================== BULK INDEX =====================

def bulk_index():
    """
    Read all files directly from Azure Blob Storage,
    chunk, embed with text-embedding-3-large, push to nike-index.
    """
    print("Starting bulk indexing from Azure Blob Storage...")
    all_docs = []

    try:
        container_client = blob_service.get_container_client(CONTAINER_NAME)
        blobs = list(container_client.list_blobs())
    except Exception as e:
        print(f"❌ Could not connect to Blob Storage: {e}")
        return

    if not blobs:
        print(f"⚠️  No files found in container: {CONTAINER_NAME}")
        return

    print(f"Found {len(blobs)} files in blob container: {CONTAINER_NAME}")

    for blob in blobs:
        print(f"  Reading: {blob.name}")

        try:
            blob_client = container_client.get_blob_client(blob.name)
            content = blob_client.download_blob().readall()
        except Exception as e:
            print(f"  ❌ Could not read {blob.name}: {e}")
            continue

        # Extract text based on file type
        text = read_file_bytes(blob.name, content)

        if not text.strip():
            print(f"  ⚠️  Skipping empty or unreadable file: {blob.name}")
            continue

        chunks = chunk_text(text)

        for i, chunk in enumerate(chunks):
            # ✅ md5 hash — handles any filename with special characters
            doc_id = hashlib.md5(f"{blob.name}-{i}".encode()).hexdigest()
            all_docs.append({
                "id": doc_id,
                "content": chunk,
                "file_name": blob.name,
                "contentVector": get_embedding(chunk)
            })

        print(f"  ✅ {blob.name}: {len(chunks)} chunks")
        extract_and_store_images(blob.name, content)

    print(f"Total chunks to index: {len(all_docs)}")

    if not all_docs:
        print("⚠️  No content extracted from any file.")
        return

    # Upload in batches of 100
    url = f"{AZURE_SEARCH_ENDPOINT}/indexes/{INDEX_NAME}/docs/index?api-version=2024-07-01"
    headers = {"Content-Type": "application/json", "api-key": AZURE_SEARCH_KEY}

    for i in range(0, len(all_docs), 100):
        batch = all_docs[i:i + 100]
        res = requests.post(url, headers=headers, json={"value": batch})
        print(f"  Batch {i // 100 + 1}: HTTP {res.status_code}")
        if res.status_code not in [200, 201]:
            print(f"  ❌ Batch error: {res.text}")

    print("✅ Bulk indexing from Blob Storage complete!")

# ===================== IMAGE EXTRACTION =====================

IMAGES_FOLDER = "doc-images"

def extract_and_store_images(filename: str, content: bytes) -> int:
    """Extract images from PDF/DOCX and store in blob. Returns count stored."""
    stored = 0
    try:
        if filename.lower().endswith(".pdf"):
            doc = fitz.open(stream=content, filetype="pdf")
            img_idx = 0
            for page_num in range(len(doc)):
                for img in doc.get_page_images(page_num, full=True):
                    xref = img[0]
                    base = doc.extract_image(xref)
                    img_bytes = base["image"]
                    ext = base["ext"]
                    w, h = base.get("width", 0), base.get("height", 0)
                    if w < 100 or h < 100 or len(img_bytes) < 5000:
                        continue
                    blob_name = f"{IMAGES_FOLDER}/{filename}/img_{img_idx}.{ext}"
                    blob_service.get_blob_client(container=CONTAINER_NAME, blob=blob_name).upload_blob(img_bytes, overwrite=True)
                    img_idx += 1
                    stored += 1
                    if stored >= 10:
                        break
                if stored >= 10:
                    break
            doc.close()

        elif filename.lower().endswith(".docx"):
            with zipfile.ZipFile(io.BytesIO(content)) as z:
                media_files = [n for n in z.namelist() if n.startswith("word/media/")]
                for idx, media_name in enumerate(media_files[:10]):
                    img_bytes = z.read(media_name)
                    if len(img_bytes) < 5000:
                        continue
                    ext = media_name.rsplit(".", 1)[-1].lower()
                    if ext not in ("png", "jpg", "jpeg", "gif", "webp"):
                        continue
                    blob_name = f"{IMAGES_FOLDER}/{filename}/img_{idx}.{ext}"
                    blob_service.get_blob_client(container=CONTAINER_NAME, blob=blob_name).upload_blob(img_bytes, overwrite=True)
                    stored += 1

        print(f"  🖼️ Stored {stored} images for {filename}")
    except Exception as e:
        print(f"  ⚠️ Image extraction error for {filename}: {e}")
    return stored


def get_images_for_sources(source_filenames: list) -> list:
    """Return up to 3 images from the FIRST source file (in score order) that has images.
    Never mixes images across multiple documents."""
    try:
        container_client = blob_service.get_container_client(CONTAINER_NAME)
        for filename in source_filenames:
            prefix = f"{IMAGES_FOLDER}/{filename}/"
            blobs = list(container_client.list_blobs(name_starts_with=prefix))
            if blobs:
                return [f"/image/{blob.name}" for blob in blobs[:3]]
    except Exception as e:
        print(f"Image lookup error: {e}")
    return []


@app.get("/image/{blob_path:path}")
async def serve_image(blob_path: str):
    """Proxy endpoint — serves images from Azure Blob Storage."""
    try:
        content = blob_service.get_blob_client(container=CONTAINER_NAME, blob=blob_path).download_blob().readall()
        ext = blob_path.rsplit(".", 1)[-1].lower()
        media_type = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "gif": "image/gif", "webp": "image/webp"}.get(ext, "image/png")
        return Response(content=content, media_type=media_type)
    except Exception:
        raise HTTPException(status_code=404, detail="Image not found")


# ===================== UPLOAD =====================

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    """Upload a file to Blob Storage and index only that file."""
    try:
        content = await file.read()

        # 1. Upload to blob
        blob_client = blob_service.get_blob_client(
            container=CONTAINER_NAME,
            blob=file.filename
        )
        blob_client.upload_blob(content, overwrite=True)
        print(f"✅ Uploaded to blob: {file.filename}")

        # 2. Ensure index exists (creates it only on first upload)
        ensure_index_exists()

        # 3. Extract text
        text = read_file_bytes(file.filename, content)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from file.")

        # 4. Chunk, embed, push — only this file
        chunks = chunk_text(text)
        docs = []
        for i, chunk in enumerate(chunks):
            # md5 hash as key
            doc_id = hashlib.md5(f"{file.filename}-{i}".encode()).hexdigest()
            docs.append({
                "id": doc_id,
                "content": chunk,
                "file_name": file.filename,
                "contentVector": get_embedding(chunk)
            })

        url = f"{AZURE_SEARCH_ENDPOINT}/indexes/{INDEX_NAME}/docs/index?api-version=2024-07-01"
        res = requests.post(
            url,
            headers={"Content-Type": "application/json", "api-key": AZURE_SEARCH_KEY},
            json={"value": docs}
        )
        if res.status_code not in [200, 201]:
            raise HTTPException(status_code=500, detail=f"Indexing failed: {res.text}")

        print(f"✅ Indexed {len(docs)} chunks for {file.filename}")

        # 5. Extract and store images
        images_stored = extract_and_store_images(file.filename, content)

        return {"status": "uploaded", "file": file.filename, "chunks": len(docs), "images": images_stored}

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Upload Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# ===================== SEARCH =====================

def expand_query(question: str) -> str:
    """Rephrase the user question into a richer search query for better vector match."""
    try:
        response = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Rephrase the user's question as a detailed, keyword-rich search query "
                        "for a technical enterprise knowledge base. Expand acronyms, add relevant "
                        "technical synonyms, and make it specific. Return ONLY the rephrased query, "
                        "no explanation."
                    )
                },
                {"role": "user", "content": question}
            ],
            temperature=0,
            max_tokens=100
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Query expansion error: {e}")
        return question


def search(query: str):
    """Vector search with keyword fallback."""
    try:
        expanded = expand_query(query)
        print(f"Expanded query: {expanded}")
        vector = get_embedding(expanded)
        url = f"{AZURE_SEARCH_ENDPOINT}/indexes/{INDEX_NAME}/docs/search?api-version=2024-07-01"
        headers = {"Content-Type": "application/json", "api-key": AZURE_SEARCH_KEY}

        # Current vectorQueries syntax
        vector_body = {
            "vectorQueries": [
                {
                    "kind": "vector",
                    "vector": vector,
                    "fields": "contentVector",
                    "k": 5
                }
            ],
            "select": "content, file_name",
            "top": 5
        }

        res = requests.post(url, headers=headers, json=vector_body)
        print(f"Vector search: HTTP {res.status_code}")

        if res.status_code == 200:
            docs = res.json().get("value", [])
            if docs:
                return [{"content": d["content"], "file_name": d.get("file_name", ""), "score": d.get("@search.score", 0)} for d in docs]

        # Fallback: keyword search (BM25 scores aren't cosine-comparable, use fixed low score)
        print("Falling back to keyword search...")
        text_body = {
            "search": query,
            "searchFields": "content",
            "select": "content, file_name",
            "top": 5
        }
        res = requests.post(url, headers=headers, json=text_body)
        print(f"Keyword search: HTTP {res.status_code}")

        if res.status_code == 200:
            return [{"content": d["content"], "file_name": d.get("file_name", ""), "score": 0.4} for d in res.json().get("value", [])]

        return []

    except Exception as e:
        print(f"Search Error: {e}")
        return []

# ===================== FOLLOW-UP QUESTIONS =====================

def generate_followups(question: str, context: str) -> list:
    """Generate 3 short follow-up questions based on the user's question and any retrieved context."""
    try:
        context_line = f"\n\nContext: {context[:600]}" if context.strip() else ""
        response = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Based on the user's question, generate exactly 3 short follow-up questions "
                        "the user might want to ask next. Each question must be under 12 words. "
                        "Respond with ONLY a JSON array of 3 strings, no explanation, no markdown."
                    )
                },
                {
                    "role": "user",
                    "content": f"Question: {question}{context_line}"
                }
            ],
            temperature=0.4,
            max_tokens=150
        )
        raw = response.choices[0].message.content.strip()
        # Strip markdown code fences if the LLM wraps the JSON
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()
        followups = json.loads(raw)
        if isinstance(followups, list):
            return [q for q in followups if isinstance(q, str)][:3]
        return []
    except Exception as e:
        print(f"Followup generation error: {e}")
        return []

# ===================== CHAT =====================

_DIAGRAM_KEYWORDS = {"draw a diagram", "create a diagram", "flow diagram", "flowchart", "flow chart", "sequence diagram", "architecture diagram", "draw a flow", "create a flow", "draw the architecture", "show the architecture"}
_IMAGE_KEYWORDS = {"generate an image", "create an image", "make an image", "draw an image", "show an image", "produce an image", "generate image", "create image", "draw a picture", "make a picture"}

def detect_intent(question: str) -> str:
    q = question.lower()

    # Diagrams always search documents first
    if any(k in q for k in _DIAGRAM_KEYWORDS):
        return "DIAGRAM"

    # All image requests search documents first (IMAGE_RAG)
    # Plain IMAGE is only used if explicitly no-document context is needed
    if any(k in q for k in _IMAGE_KEYWORDS):
        return "IMAGE_RAG"

    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {
                "role": "system",
                "content": """
You are an intent classifier.

PRIORITY ORDER — check from top to bottom and return the FIRST match:

1. DIAGRAM → user wants a visual diagram, flowchart, or architecture drawing
   - Examples: "draw a flow diagram of X", "create a flowchart for X", "show X as a diagram"

2. IMAGE_RAG → user wants to generate an image of any topic (always search documents first)
   - Examples: "generate an image of X", "create an image of X", "draw X", "visualize X"
   - Use this for ALL image generation requests regardless of topic

3. RAG → user wants a text answer from internal documents (no visual output)
   - Examples: "what does the document say about X", "explain X", "summarize X"

4. GENERAL → greetings, capability questions, casual chat
   - Examples: "what can you do", "hello", "what is your name"

Respond with ONLY one word: GENERAL, RAG, IMAGE_RAG, or DIAGRAM
"""
            },
            {"role": "user", "content": question}
        ],
        temperature=0
    )

    intent = response.choices[0].message.content.strip().upper()
    if intent not in {"GENERAL", "RAG", "IMAGE", "IMAGE_RAG", "DIAGRAM"}:
        intent = "RAG"
    return intent


@app.post("/chat")
async def chat(query: Query):
    try:
        #  STEP 1 — Detect intent
        intent = detect_intent(query.message)

        #  STEP 2 — Search docs for RAG, IMAGE_RAG, and DIAGRAM
        context = ""
        sources = []
        confidence = 0
        if intent in ("RAG", "IMAGE_RAG", "DIAGRAM"):
            results = search(query.message)
            context = "\n\n".join(r["content"] for r in results)
            top_scores = [r.get("score", 0) for r in results[:3]]
            confidence = round(min(sum(top_scores) / len(top_scores), 1) * 100) if top_scores else 0
            seen = set()
            for r in results:
                fn = r.get("file_name", "")
                if fn and fn not in seen:
                    sources.append(fn)
                    seen.add(fn)

        #  STEP 2b — Handle IMAGE_RAG
        if intent == "IMAGE_RAG":
            def stream_image_rag():
                try:
                    if not context.strip():
                        yield "⚠️ No relevant content found in the uploaded documents to base the image on."
                        return
                    image_prompt = build_image_prompt(query.message, context)
                    print(f"Image prompt: {image_prompt}")
                    image_b64 = generate_image(image_prompt)
                    yield f"\x00IMAGE\x00{image_b64}"
                except Exception as e:
                    print(f"Image RAG error: {e}")
                    yield "⚠️ Sorry, I couldn't generate that image."
            return StreamingResponse(stream_image_rag(), media_type="text/plain")

        #  STEP 2c — Handle IMAGE (plain creative)
        if intent == "IMAGE":
            def stream_image():
                try:
                    image_b64 = generate_image(query.message)
                    yield f"\x00IMAGE\x00{image_b64}"
                except Exception as e:
                    print(f"Image generation error: {e}")
                    yield "⚠️ Sorry, I couldn't generate that image."
            return StreamingResponse(stream_image(), media_type="text/plain")

        #  STEP 2d — Handle DIAGRAM
        if intent == "DIAGRAM":
            def stream_diagram():
                try:
                    if not context.strip():
                        yield "⚠️ No relevant content found in the uploaded documents to generate a diagram."
                        return
                    diagram_code = generate_diagram(query.message, context)
                    print(f"Diagram code: {diagram_code}")
                    yield f"\x00DIAGRAM\x00{diagram_code}"
                except Exception as e:
                    print(f"Diagram error: {e}")
                    yield "⚠️ Sorry, I couldn't generate that diagram."
            return StreamingResponse(stream_diagram(), media_type="text/plain")

        #  STEP 3 — Decide mode
        if intent == "GENERAL" or not context.strip():
            system_content = f"""
You are SwooshAI, an elite Nike AI assistant.

- You can answer general questions (e.g., name, greetings, identity, simple knowledge)
- Keep responses short, friendly, and professional
- Do not use structured technical format

You have the following capabilities — tell users how to use them if asked:
- Generate images: say "generate an image of [subject]" or "draw a [subject]"
- Generate diagrams: say "draw a flow diagram of [topic]" or "create a flowchart of [process]"
- Answer from documents: upload a file and ask about its contents
- Generate images from documents: say "create an image based on the product in the document"

Examples:
Q: What is your name?
A: I’m SwooshAI, your assistant.

Q: Can you generate an image?
A: Yes! Just say something like "generate an image of a Nike running shoe" and I’ll create it for you.

Q: Good morning
A: Good morning! How can I help you today?

Be conversational and concise.
"""
        else:
            #  RAG MODE (UNCHANGED)
            system_content = f"""
You are SwooshAI, an elite Nike internal AI assistant specializing in 
technical documentation, data engineering, and enterprise systems.
 
═══════════════════════════════════════════
CORE DIRECTIVES
═══════════════════════════════════════════
1. Answer EXCLUSIVELY from the provided context
2. NEVER hallucinate, assume, or infer beyond the context
3. NEVER copy raw text — always synthesize and rephrase
4. If information is not in context, respond ONLY with:
   "I don't have that information in the current knowledge base."
 
═══════════════════════════════════════════
RESPONSE ARCHITECTURE (STRICTLY FOLLOW)
═══════════════════════════════════════════
 
## Overview
Provide a precise 2–3 sentence technical summary.
Use domain-specific terminology where appropriate.

## Technical Breakdown
- Break down components, services, or steps involved
- Reference specific tools, technologies, or configurations
- Bold key technical terms: **Lakebridge**, **Delta Lake**, **SQL Transpilation**
- Use sub-bullets for nested technical details

## Step-by-Step Process (if applicable)
1. First step with technical detail
2. Second step with technical detail
3. Continue as needed...

## Technical Considerations
- Highlight architecture decisions, limitations, or dependencies
- Mention performance implications if relevant
- Flag any prerequisites or configuration requirements

## Key Takeaway
One sentence — the most critical technical insight from the answer.
 
═══════════════════════════════════════════
TECHNICAL WRITING STANDARDS
═══════════════════════════════════════════
- Use precise technical vocabulary (e.g., "transpilation" not "conversion")
- Reference specific services by their full name on first use
- Format code, commands, or config values in backticks: `like this`
- Keep sentences short and information-dense
- Prioritize accuracy over completeness
- Never pad responses with filler content
 
═══════════════════════════════════════════
CONTEXT
═══════════════════════════════════════════
{context}
"""

        def stream():
            try:
                # STEP 4 — Adjust user prompt based on intent
                user_prompt = (
                    f"Give a structured answer with bullet points: {query.message}"
                    if intent == "RAG" and context.strip()
                    else f"Answer this clearly and conversationally: {query.message}"
                )

                response = client.chat.completions.create(
                    model=CHAT_MODEL,
                    messages=[
                        {"role": "system", "content": system_content},
                        {"role": "user", "content": user_prompt}
                    ],
                    stream=True
                )

                for chunk in response:
                    if not chunk.choices:
                        continue
                    delta = chunk.choices[0].delta
                    if hasattr(delta, "content") and delta.content:
                        yield delta.content

                if sources:
                    yield f"\x00SOURCES\x00{json.dumps(sources)}"

                if intent == "RAG" and context.strip():
                    images = get_images_for_sources(sources)
                    if images:
                        yield f"\x00IMAGES\x00{json.dumps(images)}"

                    yield f"\x00CONFIDENCE\x00{confidence}"
                    followups = generate_followups(query.message, context)
                    if followups:
                        yield f"\x00FOLLOWUPS\x00{json.dumps(followups)}"

            except Exception as e:
                print(f"OpenAI Streaming Error: {e}")
                yield "⚠️ Error generating response."

        return StreamingResponse(stream(), media_type="text/plain")

    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ===================== HEALTH & TRIGGERS =====================

@app.get("/")
def health():
    return {
        "status": "✅ Azure RAG Backend Running",
        "embed_model": EMBED_MODEL,
        "dimensions": VECTOR_DIMENSIONS
    }

@app.post("/create-index")
def trigger_create_index():
    """Deletes and recreates nike-index with 3072 dimensions. Clears all data."""
    try:
        create_index()
        return {"status": f"Index created with {VECTOR_DIMENSIONS} dimensions"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/bulk-index")
def trigger_bulk_index():
    """Indexes all files in the data folder into nike-index."""
    try:
        bulk_index()
        return {"status": "Bulk indexing completed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    







    