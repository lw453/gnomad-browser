import PropTypes from 'prop-types'
import React from 'react'

import ClinvarVariantTrack from '../ClinvarVariantsTrack/ClinvarVariantTrack'
import formatClinvarDate from '../ClinvarVariantsTrack/formatClinvarDate'
import { labelForDataset, referenceGenomeForDataset } from '../datasets'
import Query from '../Query'
import filterVariantsInZoomRegion from '../RegionViewer/filterVariantsInZoomRegion'
import { TrackPageSection } from '../TrackPage'
import annotateVariantsWithClinvar from '../VariantList/annotateVariantsWithClinvar'
import Variants from '../VariantList/Variants'

const VariantsInRegion = ({
  clinvarReleaseDate,
  clinvarVariants,
  datasetId,
  region,
  variants,
  zoomRegion,
}) => {
  const datasetLabel = labelForDataset(datasetId)

  return (
    <>
      <TrackPageSection>
        <h2>ClinVar variants</h2>
      </TrackPageSection>
      {clinvarVariants.length > 0 ? (
        <>
          <ClinvarVariantTrack
            referenceGenome={referenceGenomeForDataset(datasetId)}
            transcripts={region.genes.flatMap(gene => gene.transcripts)}
            variants={filterVariantsInZoomRegion(clinvarVariants, zoomRegion)}
          />
          <TrackPageSection as="p">
            Data displayed here is from ClinVar&apos;s {formatClinvarDate(clinvarReleaseDate)}{' '}
            release.
          </TrackPageSection>
        </>
      ) : (
        <TrackPageSection as="p">No ClinVar variants found in this region.</TrackPageSection>
      )}

      <Variants
        clinvarReleaseDate={clinvarReleaseDate}
        context={region}
        datasetId={datasetId}
        exportFileName={`${datasetLabel}_${region.chrom}-${region.start}-${region.stop}`}
        variants={filterVariantsInZoomRegion(variants, zoomRegion)}
      />
    </>
  )
}

VariantsInRegion.propTypes = {
  clinvarReleaseDate: PropTypes.string.isRequired,
  clinvarVariants: PropTypes.arrayOf(PropTypes.object),
  datasetId: PropTypes.string.isRequired,
  region: PropTypes.shape({
    chrom: PropTypes.string.isRequired,
    start: PropTypes.number.isRequired,
    stop: PropTypes.number.isRequired,
    genes: PropTypes.arrayOf(
      PropTypes.shape({
        transcripts: PropTypes.arrayOf(PropTypes.object).isRequired,
      })
    ).isRequired,
  }).isRequired,
  variants: PropTypes.arrayOf(PropTypes.object).isRequired,
  zoomRegion: PropTypes.shape({
    start: PropTypes.number.isRequired,
    stop: PropTypes.number.isRequired,
  }),
}

VariantsInRegion.defaultProps = {
  clinvarVariants: null,
  zoomRegion: null,
}

const query = `
query VariantInRegion($chrom: String!, $start: Int!, $stop: Int!, $datasetId: DatasetId!, $referenceGenome: ReferenceGenomeId!) {
  meta {
    clinvar_release_date
  }
  region(start: $start, stop: $stop, chrom: $chrom, reference_genome: $referenceGenome) {
    clinvar_variants {
      clinical_significance
      clinvar_variation_id
      gnomad {
        exome {
          ac
          an
          filters
        }
        genome {
          ac
          an
          filters
        }
      }
      gold_stars
      hgvsc
      hgvsp
      in_gnomad
      major_consequence
      pos
      review_status
      transcript_id
      variant_id
    }
    variants(dataset: $datasetId) {
      consequence
      flags
      gene_id
      gene_symbol
      hgvs
      hgvsc
      hgvsp
      lof
      lof_filter
      lof_flags
      pos
      rsids
      transcript_id
      transcript_version
      variant_id
      exome {
        ac
        ac_hemi
        ac_hom
        an
        af
        filters
        populations {
          id
          ac
          an
          ac_hemi
          ac_hom
        }
      }
      genome {
        ac
        ac_hemi
        ac_hom
        an
        af
        filters
        populations {
          id
          ac
          an
          ac_hemi
          ac_hom
        }
      }
      lof_curation {
        verdict
        flags
      }
    }
  }
}`

const ConnectedVariantsInRegion = ({ datasetId, region }) => (
  <Query
    query={query}
    variables={{
      datasetId,
      chrom: region.chrom,
      start: region.start,
      stop: region.stop,
      referenceGenome: referenceGenomeForDataset(datasetId),
    }}
    loadingMessage="Loading variants"
    errorMessage="Unable to load variants"
    success={data => data.region && data.region.variants}
  >
    {({ data }) => {
      return (
        <VariantsInRegion
          clinvarReleaseDate={data.meta.clinvar_release_date}
          clinvarVariants={data.region.clinvar_variants}
          datasetId={datasetId}
          region={region}
          variants={annotateVariantsWithClinvar(data.region.variants, data.region.clinvar_variants)}
        />
      )
    }}
  </Query>
)

ConnectedVariantsInRegion.propTypes = {
  datasetId: PropTypes.string.isRequired,
  region: PropTypes.shape({
    chrom: PropTypes.string.isRequired,
    start: PropTypes.number.isRequired,
    stop: PropTypes.number.isRequired,
  }).isRequired,
}

export default ConnectedVariantsInRegion
