# Why Use Groq and HuggingFace

Groq and HuggingFace APIs are used together in this project for complementary tasks:

**Groq API**  
- Generates text responses using the llama-3.1-8b-instant model  
- Handles routing (RouterAgent), math calculations (MathAgent), and final answer generation (KnowledgeAgent)

**HuggingFace API**  
- Creates semantic embeddings with sentence-transformers/all-MiniLM-L6-v2  
- Enables semantic search to find relevant articles

**Workflow**  
1. HuggingFace finds relevant documents using embeddings and cosine similarity  
2. Groq generates answers based on the selected context

**Why Both?**  
- Groq: Fast, efficient text generation  
- HuggingFace: High-quality semantic search  
- Using only one would limit functionality (no semantic search or no conversational answers)

**Conclusion**  
Combining Groq and HuggingFace ensures precise context retrieval and natural text generation, optimizing performance and cost.
