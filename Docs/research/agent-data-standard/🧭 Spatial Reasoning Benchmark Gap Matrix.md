🧭 Spatial Reasoning Benchmark Gap Matrix
Task Type	Benchmark / Source	Model Ceiling (Approx.)	Dominant Failure Mode	Mitigation Strategies for Spatial.Properties / FBAI Stack
Long-Horizon Vision-Language Navigation (multi-step spatial planning)	LH-VLN (2024, arXiv 2412.09082)	~55–60 % success rate over 150-step sequences	Models lose context memory, struggle with landmark continuity, poor obstacle-aware path planning	• Embed Spatial Packs as memory-cacheable scene graphs for each environment tile.
• Introduce geo-temporal replay buffers that persist “agent trajectory + local pack state.”
• Use hybrid reasoning pipelines: LLM (semantic) + path-planning engine (graph/mesh).
Map-based reasoning over text + visual + API queries	MapEval v2 (2025 ICML)	GPT-4o / Gemini-1.5 Pro ≈ 67 %	Confusion between metric and ordinal spatial relations; poor grounding between textual cues and visual map context	• Expose Map-based QA endpoint over Spatial.Context CDN, returning structured geometry metadata (bbox, centroid, adjacency).
• Enable multi-modal adapters: image encoder → GeoParquet tile index.
• Fine-tune with synthetic Q/A pairs generated from Spatial Packs.
Qualitative topological reasoning (inside, overlaps, touches, etc.)	Geospatial Reasoning Benchmark (2025, arXiv 2505.17136)	~0.66 accuracy (GPT-4)	Fails to apply RCC-8 predicates consistently, missing context of region connectivity	• Integrate RCC-8 schema layer into pack metadata; publish adjacency graphs as lookup tables.
• Train auxiliary symbolic → LLM translators that enforce logical closure on RCC-8 relations.
Topological composition & transitivity (A R B + B R C ⇒ A R C)	RCC-8 Composition tests (QR 2023 / RCC benchmarks)	< 50 %	Logical chain failure: can’t maintain consistent inference across triple relations	• Embed rule-based reasoning microservice (e.g., Sympy logic + GeoSPARQL rules) callable by LLM.
• Cache derived transitive closures within Spatial Pack graph metadata.
Quantitative map-metric reasoning (distance, bearing, route)	MapEval visual tasks	~60 %	Mixes scale and direction; numeric reasoning errors	• Implement GeoMath Toolkit (vectorized Haversine, buffer, azimuth) as callable API tools for LLM agents.
• Auto-generate explanation traces showing numeric step-by-step inference.
Spatial-temporal correlation reasoning (e.g., “north-west of X yesterday”)	Emerging test splits (MapEval Temporal + custom GeoQA)	≤ 55 %	Fails temporal anchoring; confuses dynamic state changes	• Version every Spatial Pack with timestamped STAC metadata.
• Introduce temporal join service to let models query “state @ t.”
Cross-scale spatial synthesis (local → regional → global)	Not yet standardized; observed across tasks	n/a (qualitative gap)	Models lack hierarchical spatial awareness	• Adopt H3/S2 multi-resolution pack indexing.
• Expose parent–child pack links for hierarchical reasoning.
Commonsense geo-reasoning (e.g., “rivers flow downhill to sea”)	GeoBench Lite / internal probes	50–65 %	Missing physical/commonsense priors	• Augment LLM context with physical ontology pack (DEM slope, hydrography, landcover).
• Fuse with physics-aware reasoning modules (terrain graphs, gradient vectors).
🧩 Integration-Level Summary
Failure Theme	Why It Matters for Spatial.Properties	System-Level Countermeasure
Loss of spatial continuity over long tasks	Agent workflows in utilities/mining need memory of prior map context	Spatial Memory Layer (local tile cache + semantic summary)
Weak topological logic	Compliance, network connectivity, fire-risk adjacency rely on consistent RCC-8 logic	Pack-level Topology Engine + pre-computed adjacency tables
Inconsistent multimodal grounding	Map, imagery, and text prompts must align for AI-in-GIS co-pilot	Multimodal Alignment Adapters (image → geometry → LLM tokenizer)
Numeric reasoning drift	Quantitative decisions (e.g., asset distance, buffer zone) require precision	Deterministic GeoMath Tooling + auditable calc traces
Poor temporal understanding	Many datasets are time-versioned (e.g., weather, fire risk)	Time-aware STAC index + temporal query operators
Scaling from local to global	Spatial.Context CDN must serve hierarchical packs efficiently	H3/S2 multi-scale indexing + progressive LOD streaming
🧱 Strategic Fit to Your Stack
Spatial.Properties Component	Gap Addressed	Implementation Direction
Spatial Pack Schema	RCC-8 / topology / temporal versioning	Extend metadata → include RCC-8 matrix, timestamp, adjacency graph
Spatial Context CDN	MapEval and GeoQA retrieval deficits	Add GeoJSON/PMTiles → LLM toolchain; expose REST and LangChain tool wrappers
AI Gateway / MCP Server	Multi-step reasoning gaps	Route tasks through symbolic and numeric sub-agents before LLM summarization
FBAI Training Programs	Human-in-the-loop weakness	Develop “Spatial Reasoning Clinic” curriculum using MapEval samples + local data
Spatial CDN Sandbox (VibeGIS)	Benchmarks replication / fine-tuning	Build open leaderboard comparing models on WA-specific spatial tasks