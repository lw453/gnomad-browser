import argparse

parser = argparse.ArgumentParser(
    "This script reformats regional missense constraint data for generation of browser screenshots"
)
parser.add_argument(
    "--transcript", help="Input transcript",
)
parser.add_argument(
    "--add-exon", action="store_true", help="Whether to add exon RMC tracks",
)
args = parser.parse_args()

gnomad_rmc_path = "/path/to/gnomad_all_mc.tsv"
exon_rmc_path = "/path/to/gnomad_exac_exon_obs_exp.tsv"

def get_rmc_sections(tsv_path, cols_dict):
    '''
    Get RMC section coordinates and information of this transcript for embedding
    
    tsv_path: File path to read RMC information from
    cols_dict: Dictionary where keys are 
      `['transcript','start','end','obs','exp','chisq']`
      and values are corresponding column names in the file at `tsv_path`
    '''
    with open(tsv_path) as t:
        header = t.readline().strip().split('\t')
        header_dict = {}
        for idx, item in enumerate(header):
            for key, val in cols_dict.items():
                if item == val:
                    header_dict[key] = idx
        sections = ""
        for line in t:
            line = line.strip().split('\t')
            if line[header_dict['transcript']] == args.transcript:
                # Change NaN values to 0 for insertion into page
                if line[header_dict['chisq']] == 'NaN':
                    line[header_dict['chisq']] = '0'
                sections = sections + \
                    f"\
            {{\n\
              start: {int(line[header_dict['start']])},\n\
              stop: {int(line[header_dict['end']])},\n\
              observed_missense: {int(line[header_dict['obs']])},\n\
              expected_missense: {float(line[header_dict['exp']])},\n\
              chisq: {float(line[header_dict['chisq']])}\n\
            }},\n"
        return sections

def get_rmc_embed(track_name, tsv_path, cols_dict):
    '''
    Get RMC embedding
    
    track_name: Name to assign to the track in browser
    tsv_path: File path to read RMC information from
    cols_dict: Dictionary where keys are 
      `['transcript','start','end','obs','exp','chisq']`
      and values are corresponding column names in the file at `tsv_path` 
    '''
    embed_start = f"\
        <RegionalConstraintTrack\n\
          constrainedRegions={{[\n"
    embed_info = get_rmc_sections(tsv_path, cols_dict)
    embed_end = f'\
          ].map(r => ({{\n\
            start: r.start,\n\
            stop: r.stop,\n\
            obs_mis: r.observed_missense,\n\
            exp_mis: r.expected_missense,\n\
            obs_exp: r.observed_missense / r.expected_missense,\n\
            chisq_diff_null: r.chisq,\n\
          }}))}}\n\
          exons={{gene.exons}}\n\
          title="{track_name}"\n\
        />'
    return embed_start + embed_info + embed_end 

gnomad_rmc_embed = get_rmc_embed(
    "Regional missense constraint",
    gnomad_rmc_path,
    {'transcript': 'transcript',
     'start': 'section_start',
     'end': 'section_end',
     'obs': 'section_obs',
     'exp': 'section_exp',
     'chisq': 'section_chisq'}
)
print(gnomad_rmc_embed + '\n')

if args.add_exon:
  gnomad_exon_rmc_embed = get_rmc_embed(
      "gnomAD RMC by exon",
      exon_rmc_path,
      {'transcript': 'transcript',
       'start': 'exon_start',
       'end': 'exon_end',
       'obs': 'gnomad_obs',
       'exp': 'gnomad_exp',
       'chisq': 'gnomad_chisq'}
  )
  exac_exon_rmc_embed = get_rmc_embed(
      "ExAC RMC by exon",
      exon_rmc_path,
      {'transcript': 'transcript',
       'start': 'exon_start',
       'end': 'exon_end',
       'obs': 'exac_obs',
       'exp': 'exac_exp',
       'chisq': 'exac_chisq'}
  )
  print(gnomad_exon_rmc_embed + '\n')
  print(
      f'\
          {{gene.exac_regional_missense_constraint_regions && (\n\
            <RegionalConstraintTrack\n\
              constrainedRegions={{gene.exac_regional_missense_constraint_regions}}\n\
              exons={{gene.exons}}\n\
              title="Regional missense constraint (ExAC)"\n\
            />\n\
          )}}\n\
      '
  )
  print(exac_exon_rmc_embed)
else:
  print(
      f'\
          {{gene.exac_regional_missense_constraint_regions && (\n\
            <RegionalConstraintTrack\n\
              constrainedRegions={{gene.exac_regional_missense_constraint_regions}}\n\
              exons={{gene.exons}}\n\
              title="Original RMC metric"\n\
            />\n\
          )}}\n\
      '
  )

