"""
ReguloMe — Network Service
Regulatory network graph data (nodes + edges) suitable for D3.js force-directed layout.
Full synthetic data will be enriched in Part 5.
"""
from app.services.persona_service import PersonaService
from app.schemas.responses import NetworkNode, NetworkEdge, NetworkGraphResponse


def _build_inflammatory_network() -> tuple[list[dict], list[dict]]:
    """Inflammatory Immune-Skewed persona network."""
    nodes = [
        # Transcription Factors
        dict(id="tf_nfkb", label="NF-κB", type="transcription_factor", size=28, color="#ef4444"),
        dict(id="tf_stat3", label="STAT3", type="transcription_factor", size=24, color="#ef4444"),
        dict(id="tf_irf4", label="IRF4", type="transcription_factor", size=18, color="#ef4444"),
        dict(id="tf_gata3", label="GATA3", type="transcription_factor", size=16, color="#ef4444"),
        dict(id="tf_ap1", label="AP-1", type="transcription_factor", size=20, color="#ef4444"),
        # Enhancers
        dict(id="enh_chr6", label="chr6:32M Enhancer", type="enhancer", size=22, color="#f59e0b"),
        dict(id="enh_chr17", label="chr17:44M Enhancer", type="enhancer", size=16, color="#f59e0b"),
        dict(id="enh_chr12", label="chr12:111M Enhancer", type="enhancer", size=14, color="#f59e0b"),
        # Genes
        dict(id="gene_hla_drb1", label="HLA-DRB1", type="gene", size=20, color="#22c55e"),
        dict(id="gene_hla_dqb1", label="HLA-DQB1", type="gene", size=18, color="#22c55e"),
        dict(id="gene_ptpn22", label="PTPN22", type="gene", size=16, color="#22c55e"),
        dict(id="gene_ormdl3", label="ORMDL3", type="gene", size=12, color="#22c55e"),
        dict(id="gene_sh2b3", label="SH2B3", type="gene", size=14, color="#22c55e"),
        dict(id="gene_tnf", label="TNF", type="gene", size=22, color="#22c55e"),
        dict(id="gene_il6", label="IL6", type="gene", size=20, color="#22c55e"),
        # Pathways
        dict(id="pw_nfkb", label="NF-κB Signaling", type="pathway", size=26, color="#a855f7"),
        dict(id="pw_jakstat", label="JAK-STAT", type="pathway", size=22, color="#a855f7"),
        dict(id="pw_tnf", label="TNF-α Cascade", type="pathway", size=20, color="#a855f7"),
        # Tissues
        dict(id="tis_immune", label="Immune Cells", type="tissue", size=24, color="#06b6d4"),
        dict(id="tis_spleen", label="Spleen", type="tissue", size=16, color="#06b6d4"),
        dict(id="tis_lung", label="Lung", type="tissue", size=12, color="#06b6d4"),
        # Disease
        dict(id="dis_inflam", label="Inflammatory & Immune", type="disease", size=28, color="#ec4899"),
    ]
    edges = [
        # TF → Enhancer
        dict(source="tf_nfkb", target="enh_chr6", weight=0.92, type="regulates"),
        dict(source="tf_stat3", target="enh_chr6", weight=0.85, type="regulates"),
        dict(source="tf_gata3", target="enh_chr17", weight=0.79, type="regulates"),
        dict(source="tf_ap1", target="enh_chr6", weight=0.71, type="regulates"),
        # Enhancer → Gene
        dict(source="enh_chr6", target="gene_hla_drb1", weight=0.90, type="activates"),
        dict(source="enh_chr6", target="gene_hla_dqb1", weight=0.85, type="activates"),
        dict(source="enh_chr17", target="gene_ormdl3", weight=0.72, type="activates"),
        dict(source="enh_chr12", target="gene_sh2b3", weight=0.68, type="represses"),
        # TF → Gene (direct)
        dict(source="tf_nfkb", target="gene_tnf", weight=0.94, type="activates"),
        dict(source="tf_stat3", target="gene_il6", weight=0.88, type="activates"),
        dict(source="tf_irf4", target="gene_ptpn22", weight=0.75, type="represses"),
        # Gene → Pathway
        dict(source="gene_tnf", target="pw_tnf", weight=0.91, type="associated"),
        dict(source="gene_il6", target="pw_jakstat", weight=0.87, type="associated"),
        dict(source="gene_hla_drb1", target="pw_nfkb", weight=0.83, type="associated"),
        # Pathway → Tissue
        dict(source="pw_nfkb", target="tis_immune", weight=0.89, type="interacts"),
        dict(source="pw_jakstat", target="tis_immune", weight=0.82, type="interacts"),
        dict(source="pw_tnf", target="tis_spleen", weight=0.74, type="interacts"),
        # Pathway → Disease
        dict(source="pw_nfkb", target="dis_inflam", weight=0.93, type="associated"),
        dict(source="pw_jakstat", target="dis_inflam", weight=0.86, type="associated"),
        dict(source="pw_tnf", target="dis_inflam", weight=0.88, type="associated"),
    ]
    return nodes, edges


def _build_default_network(persona_id: str) -> tuple[list[dict], list[dict]]:
    """Simplified default network for other personas."""
    nodes = [
        dict(id="tf_1", label="TF-Alpha", type="transcription_factor", size=22, color="#ef4444"),
        dict(id="tf_2", label="TF-Beta", type="transcription_factor", size=18, color="#ef4444"),
        dict(id="enh_1", label="Enhancer-1", type="enhancer", size=18, color="#f59e0b"),
        dict(id="enh_2", label="Enhancer-2", type="enhancer", size=14, color="#f59e0b"),
        dict(id="gene_1", label="Gene-A", type="gene", size=20, color="#22c55e"),
        dict(id="gene_2", label="Gene-B", type="gene", size=16, color="#22c55e"),
        dict(id="gene_3", label="Gene-C", type="gene", size=14, color="#22c55e"),
        dict(id="pw_1", label="Pathway-1", type="pathway", size=22, color="#a855f7"),
        dict(id="pw_2", label="Pathway-2", type="pathway", size=18, color="#a855f7"),
        dict(id="tis_1", label="Primary Tissue", type="tissue", size=20, color="#06b6d4"),
        dict(id="tis_2", label="Secondary Tissue", type="tissue", size=14, color="#06b6d4"),
        dict(id="dis_1", label="Disease Domain", type="disease", size=24, color="#ec4899"),
    ]
    edges = [
        dict(source="tf_1", target="enh_1", weight=0.88, type="regulates"),
        dict(source="tf_2", target="enh_2", weight=0.75, type="regulates"),
        dict(source="enh_1", target="gene_1", weight=0.85, type="activates"),
        dict(source="enh_1", target="gene_2", weight=0.72, type="activates"),
        dict(source="enh_2", target="gene_3", weight=0.68, type="activates"),
        dict(source="tf_1", target="gene_1", weight=0.90, type="activates"),
        dict(source="gene_1", target="pw_1", weight=0.87, type="associated"),
        dict(source="gene_2", target="pw_2", weight=0.78, type="associated"),
        dict(source="pw_1", target="tis_1", weight=0.82, type="interacts"),
        dict(source="pw_2", target="tis_2", weight=0.70, type="interacts"),
        dict(source="pw_1", target="dis_1", weight=0.86, type="associated"),
    ]
    return nodes, edges


# Map persona IDs to specialized network builders
_NETWORK_BUILDERS = {
    "inflammatory": _build_inflammatory_network,
}


class NetworkService:
    """Regulatory network graph data for D3.js visualization."""

    @staticmethod
    def get_network(persona_id: str) -> NetworkGraphResponse:
        PersonaService.get_by_id(persona_id)  # validates existence

        builder = _NETWORK_BUILDERS.get(persona_id)
        if builder:
            raw_nodes, raw_edges = builder()
        else:
            raw_nodes, raw_edges = _build_default_network(persona_id)

        nodes = [NetworkNode(**n) for n in raw_nodes]
        edges = [NetworkEdge(**e) for e in raw_edges]

        return NetworkGraphResponse(nodes=nodes, edges=edges)
