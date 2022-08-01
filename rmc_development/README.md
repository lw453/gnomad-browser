# 1. Download RMC O/E files
| Description | Location |  
| :---------- | :------- |  
| gnomAD RMC results | `gs://regional_missense_constraint/temp/gnomad_all_mc.tsv` |  
| Exon missense O/E from gnomAD and ExAC | `gs://regional_missense_constraint/temp/gnomad_exac_exon_obs_exp.tsv` |

Change `gnomad_rmc_path` and `exon_rmc_path` in `rmc_development/get_GenePage_rmc_embeds.py` to the local paths for the two files above.

# 2. Load local browser instance
```sh
touch browser/build.env
cd gnomad-browser
./development/env.sh browser up
```

# 3. Add RMC tracks to browser page for a given gene
```sh
cd rmc_development
./create_gene_page.sh ENSTXXXXXXXXXXX exon
```

# 4. Visualize in browser
Go to `localhost:8008` and search for the gene input in Step 3.
