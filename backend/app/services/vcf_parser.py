"""
VCF PARSER
Reads user genome files and extracts genetic variants.

Supports:
  Standard VCF (.vcf or .vcf.gz)
  23andMe raw data export (.txt)
  AncestryDNA raw data export (.txt)

A VCF file looks like:
  ##fileformat=VCFv4.1
  #CHROM  POS       ID        REF  ALT
  chr1    925952    rs41285   G    A
  chr19   44908684  rs429358  T    C

A 23andMe file looks like:
  # rsid      chromosome  position  genotype
  rs4477212   1           82154     AA
  rs3094315   1           752566    AG

An AncestryDNA file looks like:
  rsid       chromosome  position  allele1  allele2
  rs4477212  1           82154     A        A
"""

from typing import List, Dict, Tuple


def detect_file_type(content: str) -> str:
    first_2000 = content[:2000]
    if "##fileformat=VCF" in first_2000:
        return "vcf"
    if "23andMe" in first_2000 or (
        "rsid\tchromosome\tposition\tgenotype" in first_2000.lower()
    ):
        return "23andme"
    if "AncestryDNA" in first_2000 or (
        "rsid\tchromosome\tposition\tallele1\tallele2" in first_2000.lower()
    ):
        return "ancestry"
    # Try to auto-detect by first data line
    for line in first_2000.split("\n"):
        if not line or line.startswith("#"):
            continue
        parts = line.strip().split("\t")
        if len(parts) >= 5 and not parts[0].startswith("rs"):
            return "vcf"
        if len(parts) == 4 and parts[0].startswith("rs"):
            return "23andme"
        if len(parts) == 5 and parts[0].startswith("rs"):
            return "ancestry"
    return "vcf"


def _normalize_chrom(chrom: str) -> str:
    if not chrom.startswith("chr"):
        return "chr" + chrom
    return chrom


def parse_vcf(content: str, max_variants: int = 500) -> Tuple[List[Dict], int]:
    variants, total = [], 0
    for line in content.split("\n"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) < 5:
            continue
        chrom, pos_str, rsid, ref, alt = parts[0], parts[1], parts[2], parts[3], parts[4]
        if not rsid or rsid == "." or not rsid.startswith("rs"):
            continue
        if "," in alt:
            alt = alt.split(",")[0]
        try:
            position = int(pos_str)
        except ValueError:
            continue
        chrom = _normalize_chrom(chrom)
        genotype = f"{ref}/{alt}"
        # Try to decode genotype from FORMAT/SAMPLE columns
        if len(parts) >= 10:
            fmt = parts[8].split(":") if len(parts) > 8 else []
            smp = parts[9].split(":") if len(parts) > 9 else []
            gt_map = dict(zip(fmt, smp))
            gt = gt_map.get("GT", "")
            if gt:
                alleles = [ref] + alt.split(",")
                try:
                    indices = gt.replace("|", "/").split("/")
                    decoded = [alleles[int(i)] for i in indices if i.isdigit() and int(i) < len(alleles)]
                    if decoded:
                        genotype = "/".join(decoded)
                except (ValueError, IndexError):
                    pass
        total += 1
        if len(variants) < max_variants:
            variants.append({
                "rsid": rsid, "chromosome": chrom, "position": position,
                "ref_allele": ref, "alt_allele": alt, "genotype": genotype,
            })
    return variants, total


def parse_23andme(content: str, max_variants: int = 500) -> Tuple[List[Dict], int]:
    variants, total = [], 0
    for line in content.split("\n"):
        line = line.strip()
        if not line or line.startswith("#") or line.lower().startswith("rsid"):
            continue
        parts = line.split("\t")
        if len(parts) < 4:
            parts = line.split()
        if len(parts) < 4:
            continue
        rsid, chrom, pos_str, genotype = parts[0], parts[1], parts[2], parts[3]
        if not rsid.startswith("rs"):
            continue
        if "--" in genotype or genotype == "00" or len(genotype) < 1:
            continue
        try:
            position = int(pos_str)
        except ValueError:
            continue
        chrom = _normalize_chrom(chrom)
        # 23andMe genotype is like "AG" — convert to "A/G"
        if len(genotype) == 2:
            if genotype[0] != genotype[1]:
                ref, alt = genotype[0], genotype[1]
            else:
                alt = genotype[0]
                ref = "G" if alt == "A" else "A"
            fmt_genotype = f"{genotype[0]}/{genotype[1]}"
        elif len(genotype) == 1:
            alt = genotype[0]
            ref = "G" if alt == "A" else "A"
            fmt_genotype = f"{alt}/{alt}"
        else:
            ref = genotype[0]
            alt = genotype[-1] if genotype[-1] != genotype[0] else ("G" if genotype[0] == "A" else "A")
            fmt_genotype = f"{genotype[0]}/{genotype[-1]}"
        total += 1
        if len(variants) < max_variants:
            variants.append({
                "rsid": rsid, "chromosome": chrom, "position": position,
                "ref_allele": ref, "alt_allele": alt, "genotype": fmt_genotype,
            })
    return variants, total


def parse_ancestry(content: str, max_variants: int = 500) -> Tuple[List[Dict], int]:
    variants, total = [], 0
    for line in content.split("\n"):
        line = line.strip()
        if not line or line.startswith("#") or line.lower().startswith("rsid"):
            continue
        parts = line.split("\t")
        if len(parts) < 5:
            continue
        rsid, chrom, pos_str, a1, a2 = parts[0], parts[1], parts[2], parts[3], parts[4]
        if not rsid.startswith("rs"):
            continue
        if "0" in [a1, a2]:
            continue
        try:
            position = int(pos_str)
        except ValueError:
            continue
        chrom = _normalize_chrom(chrom)
        total += 1
        if len(variants) < max_variants:
            variants.append({
                "rsid": rsid, "chromosome": chrom, "position": position,
                "ref_allele": a1, "alt_allele": a2, "genotype": f"{a1}/{a2}",
            })
    return variants, total


def parse_genome_file(content: str, max_variants: int = 500) -> Dict:
    """
    Auto-detect file type and parse.
    Returns: { file_type, total_variants_in_file, variants_extracted, variants: [...] }
    """
    file_type = detect_file_type(content)
    parsers = {
        "vcf": parse_vcf,
        "23andme": parse_23andme,
        "ancestry": parse_ancestry,
    }
    parser = parsers.get(file_type, parse_vcf)
    variants, total = parser(content, max_variants)
    # If primary parser found nothing, try 23andme as fallback
    if not variants and file_type == "vcf":
        variants, total = parse_23andme(content, max_variants)
        if variants:
            file_type = "23andme"
    return {
        "file_type": file_type,
        "total_variants_in_file": total,
        "variants_extracted": len(variants),
        "variants": variants,
    }
