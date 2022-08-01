#!/bin/bash
#
#######################################
# Create GenePage.js with tracks for RMC and (optionally) exon-level obs/exp missense in gnomAD vs. ExAC
# for any transcript that: 1. is in ExAC exon-level missense table at gs://regional_missense_constraint/resources/GRCh37/exac/exac_v3_march16_exon_table.txt
# and 2. has RMC information from gnomAD
# Example usage: 
#   No exon-level information: `./create_gene_page.sh ENST00000359106`
#   With exon-level information: `./create_gene_page.sh ENST00000359106 exon`
#######################################

transcript=$1
if [ "$2" = "exon" ]; then
  exon_rmc_flag="--add-exon"
else
  exon_rmc_flag=""
fi

gp_template_path="GenePage_template.js"
gp_output_path="../browser/src/GenePage/GenePage.js"

# Split GenePage template into before and after new constraint data
gp_template_pre=$(head -n 369 ${gp_template_path})
gp_template_post=$(tail -n+377 ${gp_template_path})

# Get Python output + combine with file
gp_rmc_embeds=$(python3 get_GenePage_rmc_embeds.py --transcript ${transcript} ${exon_rmc_flag})

# Output as new GenePage
echo -e "${gp_template_pre}\n\n${gp_rmc_embeds}\n${gp_template_post}" > ${gp_output_path}
