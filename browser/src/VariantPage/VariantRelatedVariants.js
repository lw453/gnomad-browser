import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import Link from '../Link'
import MNVSummaryList from '../MNVPage/MNVSummaryList'
import VariantLiftover from './VariantLiftover'

const CODING_AND_UTR_VEP_CONSEQUENCES = new Set([
  'transcript_ablation',
  'splice_acceptor_variant',
  'splice_donor_variant',
  'stop_gained',
  'frameshift_variant',
  'stop_lost',
  'start_lost',
  'initiator_codon_variant',
  'transcript_amplification',
  'inframe_insertion',
  'inframe_deletion',
  'missense_variant',
  'protein_altering_variant',
  'splice_region_variant',
  'incomplete_terminal_codon_variant',
  'start_retained_variant',
  'stop_retained_variant',
  'synonymous_variant',
  'coding_sequence_variant',
  'mature_miRNA_variant',
  '5_prime_UTR_variant',
  '3_prime_UTR_variant',
])

const isVariantEligibleForCooccurrence = (variant, datasetId) => {
  if (datasetId !== 'gnomad_r2_1') {
    return false
  }

  const exomeAC = ((variant.exome || {}).ac || 0) / ((variant.exome || {}).an || 1)

  return (
    exomeAC <= 0.05 &&
    variant.transcript_consequences.some(csq =>
      CODING_AND_UTR_VEP_CONSEQUENCES.has(csq.major_consequence)
    )
  )
}

const Wrapper = styled.div`
  columns: 2;
  column-gap: 30px;

  @media (max-width: 992px) {
    columns: 1;
  }
`

const Item = styled.div`
  break-inside: avoid;

  h3 {
    margin-top: 0;
  }
`

const getLocusWindow = ({ chrom, pos }, range = 20) => {
  const start = Math.max(1, pos - range)
  const stop = pos + range
  return `${chrom}-${start}-${stop}`
}

const VariantRelatedVariants = ({ datasetId, variant }) => {
  return (
    <Wrapper>
      {variant.colocated_variants && variant.colocated_variants.length > 0 && (
        <Item>
          <h3>Other Alternate Alleles</h3>
          <p>This variant is multiallelic. Other alternate alleles are:</p>
          <ul>
            {variant.colocated_variants.map(colocatedVariantId => (
              <li key={colocatedVariantId}>
                <Link to={`/variant/${colocatedVariantId}`}>{colocatedVariantId}</Link>
              </li>
            ))}
          </ul>
        </Item>
      )}

      {(variant.multi_nucleotide_variants || []).length > 0 && (
        <Item>
          <h3>Multi-nucleotide Variants</h3>
          <p>This variant&apos;s consequence may be affected by other variants:</p>
          <MNVSummaryList multiNucleotideVariants={variant.multi_nucleotide_variants} />
        </Item>
      )}

      {(variant.liftover || variant.liftover_sources || []).length > 0 && (
        <Item>
          <h3>Liftover</h3>
          <VariantLiftover variant={variant} />
        </Item>
      )}

      {isVariantEligibleForCooccurrence(variant, datasetId) && (
        <Item>
          <h3>Variant Co-occurrence</h3>
          <p>
            <Link
              to={{
                pathname: '/variant-cooccurrence',
                search: `variant=${variant.variant_id}`,
              }}
            >
              Check if this variant occurs on the same haplotype as another variant.
            </Link>
          </p>
        </Item>
      )}

      <Item>
        <h3>Nearby Variants</h3>
        <p>
          <Link to={`/region/${getLocusWindow(variant, 20)}`}>
            View variants located within 20 bases of this variant.
          </Link>
        </p>
      </Item>
    </Wrapper>
  )
}

VariantRelatedVariants.propTypes = {
  datasetId: PropTypes.string.isRequired,
  variant: PropTypes.shape({
    variant_id: PropTypes.string.isRequired,
    colocated_variants: PropTypes.arrayOf(PropTypes.string),
    liftover: PropTypes.arrayOf(PropTypes.object),
    liftover_sources: PropTypes.arrayOf(PropTypes.object),
    multi_nucleotide_variants: PropTypes.arrayOf(PropTypes.object),
    exome: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    genome: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    transcript_consequences: PropTypes.arrayOf(PropTypes.object), // eslint-disable-line react/forbid-prop-types
  }).isRequired,
}

export default VariantRelatedVariants
