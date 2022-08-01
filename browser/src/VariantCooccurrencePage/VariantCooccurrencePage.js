import PropTypes from 'prop-types'
import queryString from 'query-string'
import React, { useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import { Badge, ExternalLink, List, ListItem, Page } from '@gnomad/ui'

import { GNOMAD_POPULATION_NAMES } from '@gnomad/dataset-metadata/gnomadPopulations'

import DocumentTitle from '../DocumentTitle'
import GnomadPageHeading from '../GnomadPageHeading'
import Link from '../Link'
import Query from '../Query'
import StatusMessage from '../StatusMessage'
import { TranscriptConsequenceList } from '../VariantPage/TranscriptConsequenceList'

import CooccurrenceDataPropType from './CooccurrenceDataPropType'
import VariantCooccurrenceDetailsTable from './VariantCooccurrenceDetailsTable'
import VariantCooccurrenceHaplotypeCountsTable from './VariantCooccurrenceHaplotypeCountsTable'
import VariantCooccurrenceSummaryTable from './VariantCooccurrenceSummaryTable'
import VariantCooccurrenceVariantIdsForm from './VariantCooccurrenceVariantIdsForm'

const Section = styled.section`
  width: 100%;
`

const ResponsiveSection = styled(Section)`
  width: calc(50% - 15px);

  @media (max-width: 992px) {
    width: 100%;
  }
`

const Wrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
`

const renderProbabilityCompoundHeterozygous = p => {
  if (p === 1) {
    return '100%'
  }
  if (p > 0.99) {
    return '>99%'
  }

  if (p === 0) {
    return '0%'
  }
  if (p < 0.01) {
    return '<1%'
  }

  return `${(p * 100).toFixed(0)}%`
}

const getCooccurrenceDescription = (
  cooccurrenceInSelectedPopulation,
  selectedPopulation = 'All'
) => {
  let cooccurrenceDescription = null
  if (cooccurrenceInSelectedPopulation.p_compound_heterozygous === null) {
    const variantAOccurs =
      [3, 4, 5, 6, 7, 8].reduce(
        (acc, i) => acc + cooccurrenceInSelectedPopulation.genotype_counts[i],
        0
      ) > 0

    const variantBOccurs =
      [1, 2, 4, 5, 7, 8].reduce(
        (acc, i) => acc + cooccurrenceInSelectedPopulation.genotype_counts[i],
        0
      ) > 0

    if (!variantAOccurs || !variantBOccurs) {
      if (variantAOccurs || variantBOccurs) {
        cooccurrenceDescription = 'One of these variants is not observed in'
      } else {
        cooccurrenceDescription = 'These variants are not observed'
      }
    }
  } else if (cooccurrenceInSelectedPopulation.p_compound_heterozygous > 0.505) {
    cooccurrenceDescription =
      'Based on their co-occurrence pattern in gnomAD, these variants are likely found on different haplotypes in most'
  } else if (cooccurrenceInSelectedPopulation.p_compound_heterozygous < 0.164) {
    cooccurrenceDescription =
      'Based on their co-occurrence pattern in gnomAD, these variants are likely found on the same haplotype in most'
  } else {
    cooccurrenceDescription =
      'The co-occurrence pattern for these variants doesn’t allow us to give a robust assessment of whether these variants are on the same haplotype or not in'
  }

  if (cooccurrenceDescription) {
    if (selectedPopulation === 'All') {
      cooccurrenceDescription = `${cooccurrenceDescription} individuals in gnomAD.`
    } else {
      cooccurrenceDescription = `${cooccurrenceDescription} individuals in the ${GNOMAD_POPULATION_NAMES[selectedPopulation]} population in gnomAD.`
    }
  }

  return cooccurrenceDescription
}

const VariantCoocurrence = ({ cooccurrenceData }) => {
  const [selectedPopulation, setSelectedPopulation] = useState('All')

  const cooccurrenceInSelectedPopulation =
    selectedPopulation === 'All'
      ? cooccurrenceData
      : cooccurrenceData.populations.find(pop => pop.id === selectedPopulation)

  const cooccurrenceDescription = getCooccurrenceDescription(
    cooccurrenceInSelectedPopulation,
    selectedPopulation
  )

  // If no individual carries both variants, the co-occurrence tables are generated from the public variant data.
  const sharedCarrierExists =
    cooccurrenceData.genotype_counts[4] +
      cooccurrenceData.genotype_counts[5] +
      cooccurrenceData.genotype_counts[7] +
      cooccurrenceData.genotype_counts[8] >
    0

  return (
    <>
      <Section style={{ marginBottom: '2em' }}>
        <h2>Overview</h2>
        <VariantCooccurrenceSummaryTable
          cooccurrenceData={cooccurrenceData}
          selectedPopulation={selectedPopulation}
          onSelectPopulation={setSelectedPopulation}
        />

        {sharedCarrierExists && (
          <p>
            <Badge level="info">Note</Badge> Only samples covered at both variant sites are included
            in this table.
          </p>
        )}

        {[cooccurrenceData, ...cooccurrenceData.populations].some(
          c => c.p_compound_heterozygous === null
        ) && (
          <p>
            * A likely co-occurrence pattern cannot be calculated in some cases, such as when only
            one of the variants is observed in a population.
          </p>
        )}
      </Section>

      <h2>
        {selectedPopulation === 'All'
          ? 'Details'
          : `Details for ${GNOMAD_POPULATION_NAMES[selectedPopulation]} Population`}
      </h2>
      <p>Select a population in the overview table to view genotype counts for that population.</p>
      <Wrapper>
        <ResponsiveSection>
          <h3>Genotype Counts</h3>
          <VariantCooccurrenceDetailsTable
            variantIds={cooccurrenceData.variant_ids}
            genotypeCounts={cooccurrenceInSelectedPopulation.genotype_counts}
          />
          {cooccurrenceDescription && <p>{cooccurrenceDescription}</p>}
          {sharedCarrierExists ? (
            <p>
              <Badge level="info">Note</Badge> Only samples covered at both variant sites are
              included in this table.
            </p>
          ) : (
            <p>
              <Badge level="info">Note</Badge> Because no individual in gnomAD carries both
              variants, this table was computed based on the separate variant information and does
              not account for the possibility that some samples may not be covered at both variant
              sites.
            </p>
          )}
        </ResponsiveSection>

        <ResponsiveSection>
          <h3>
            {cooccurrenceInSelectedPopulation.genotype_counts[4] > 0 && <>Estimated </>}Haplotype
            Counts
          </h3>
          <VariantCooccurrenceHaplotypeCountsTable
            variantIds={cooccurrenceData.variant_ids}
            haplotypeCounts={cooccurrenceInSelectedPopulation.haplotype_counts}
          />
          {cooccurrenceInSelectedPopulation.p_compound_heterozygous !== null && (
            <>
              <p>
                The estimated probability that these variants occur in different haplotypes is{' '}
                {renderProbabilityCompoundHeterozygous(
                  cooccurrenceInSelectedPopulation.p_compound_heterozygous
                )}
                .
              </p>
              <p>
                <Badge level="warning">Note</Badge> Probability values are not well calibrated,
                particularly where both variants are extremely rare. Interpret with caution. Please
                see{' '}
                <ExternalLink href="https://gnomad.broadinstitute.org/news/2021-07-variant-co-occurrence-phasing-information-in-gnomad/">
                  our blog post on variant co-occurrence
                </ExternalLink>{' '}
                for accuracy estimates and additional detail.
              </p>
            </>
          )}
        </ResponsiveSection>
      </Wrapper>
    </>
  )
}

VariantCoocurrence.propTypes = {
  cooccurrenceData: CooccurrenceDataPropType.isRequired,
}

const query = `
query VariantCooccurrence($variants: [String!]!, $variant1: String!, $variant2: String, $datasetId: DatasetId!) {
  variant_cooccurrence(variants: $variants, dataset: $datasetId) {
    variant_ids
    genotype_counts
    haplotype_counts
    p_compound_heterozygous
    populations {
      id
      genotype_counts
      haplotype_counts
      p_compound_heterozygous
    }
  }
  variant1: variant(variantId: $variant1, dataset: $datasetId) {
    exome {
      ac
      an
    }
    genome {
      ac
      an
    }
    multi_nucleotide_variants {
      combined_variant_id
      other_constituent_snvs
    }
    transcript_consequences {
      gene_id
      gene_version
      gene_symbol
      hgvs
      hgvsc
      hgvsp
      is_canonical
      is_mane_select
      is_mane_select_version
      lof
      lof_flags
      lof_filter
      major_consequence
      polyphen_prediction
      sift_prediction
      transcript_id
      transcript_version
    }
  }
  variant2: variant(variantId: $variant2, dataset: $datasetId) {
    exome {
      ac
      an
    }
    genome {
      ac
      an
    }
    multi_nucleotide_variants {
      combined_variant_id
      other_constituent_snvs
    }
    transcript_consequences {
      gene_id
      gene_version
      gene_symbol
      hgvs
      hgvsc
      hgvsp
      is_canonical
      is_mane_select
      is_mane_select_version
      lof
      lof_flags
      lof_filter
      major_consequence
      polyphen_prediction
      sift_prediction
      transcript_id
      transcript_version
    }
  }
}
`

const VariantCoocurrenceContainer = ({ datasetId, variantIds }) => {
  return (
    <Query
      errorMessage="Unable to load co-occurrence"
      loadingMessage="Loading co-occurrence"
      query={query}
      variables={{
        variants: variantIds,
        variant1: variantIds[0],
        variant2: variantIds[1],
        datasetId,
      }}
      success={data => data.variant_cooccurrence}
    >
      {({ data }) => {
        const genesInCommon = [data.variant1, data.variant2]
          .map(v => new Set(v.transcript_consequences.map(csq => csq.gene_id)))
          .reduce((acc, genes) => new Set([...acc].filter(geneId => genes.has(geneId))))

        const geneSymbols = data.variant1.transcript_consequences.reduce((acc, csq) => ({
          ...acc,
          [csq.gene_id]: csq.gene_symbol,
        }))

        const multiNucleotideVariants = (
          (data.variant1 || {}).multi_nucleotide_variants || []
        ).filter(mnv => mnv.other_constituent_snvs.includes(variantIds[1]))

        return (
          <>
            {multiNucleotideVariants.length > 0 && (
              <Section>
                <h2>Multi-nucleotide Variants</h2>
                <p>
                  These variants are found in-phase in some individuals as{' '}
                  {multiNucleotideVariants.length === 1
                    ? 'a multi-nucleotide variant'
                    : 'multi-nucleotide variants'}
                  .
                </p>
                <List>
                  {multiNucleotideVariants.map(mnv => (
                    <ListItem key={mnv.combined_variant_id}>
                      <Link to={`/variant/${mnv.combined_variant_id}`}>
                        {mnv.combined_variant_id}
                      </Link>
                    </ListItem>
                  ))}
                </List>
              </Section>
            )}

            <VariantCoocurrence cooccurrenceData={data.variant_cooccurrence} />

            <Section>
              <h2>VEP Annotations</h2>
              <p>
                These variants both occur in {genesInCommon.size} gene
                {genesInCommon.size === 1 ? '' : 's'}:{' '}
                {Array.from(genesInCommon)
                  .map(geneId => (
                    <Link key={geneId} to={`/gene/${geneId}`}>
                      {geneSymbols[geneId]}
                    </Link>
                  ))
                  .flatMap(el => [', ', el])
                  .slice(1)}
                . Only annotations for {genesInCommon.size === 1 ? 'this gene' : 'these genes'} are
                shown here.
              </p>
              <Wrapper>
                <ResponsiveSection>
                  <h3>
                    <Link to={`/variant/${variantIds[0]}`}>{variantIds[0]}</Link>
                  </h3>
                  <TranscriptConsequenceList
                    transcriptConsequences={data.variant1.transcript_consequences.filter(csq =>
                      genesInCommon.has(csq.gene_id)
                    )}
                  />
                </ResponsiveSection>

                <ResponsiveSection>
                  <h3>
                    <Link to={`/variant/${variantIds[1]}`}>{variantIds[1]}</Link>
                  </h3>
                  <TranscriptConsequenceList
                    transcriptConsequences={data.variant2.transcript_consequences.filter(csq =>
                      genesInCommon.has(csq.gene_id)
                    )}
                  />
                </ResponsiveSection>
              </Wrapper>
            </Section>
          </>
        )
      }}
    </Query>
  )
}

VariantCoocurrenceContainer.propTypes = {
  datasetId: PropTypes.string.isRequired,
  variantIds: PropTypes.arrayOf(PropTypes.string).isRequired,
}

const VariantCoocurrencePage = ({ datasetId }) => {
  const history = useHistory()
  const location = useLocation()

  let { variant: variantIds } = queryString.parse(location.search)
  if (variantIds === undefined) {
    variantIds = []
  } else if (typeof variantIds === 'string') {
    variantIds = [variantIds]
  }

  return (
    <Page>
      <DocumentTitle title="Variant Co-occurrence" />
      <GnomadPageHeading
        datasetOptions={{
          // Co-occurrence data only available for gnomAD v2
          includeExac: false,
          includeGnomad2: true,
          includeGnomad2Subsets: false,
          includeGnomad3: false,
          includeStructuralVariants: false,
        }}
        selectedDataset={datasetId}
      >
        Variant Co-Occurrence
      </GnomadPageHeading>
      {datasetId === 'gnomad_r2_1' ? (
        <>
          <p>
            For more information about co-occurrence data and how to use this tool, see our{' '}
            <ExternalLink href="https://gnomad.broadinstitute.org/news/2021-07-variant-co-occurrence-phasing-information-in-gnomad/">
              &ldquo;Variant Co-Occurrence (Phasing) Information in gnomAD&rdquo; blog post
            </ExternalLink>
            .
          </p>
          <Section style={{ marginBottom: '2em' }}>
            <h2>Select a variant pair</h2>
            <p>Co-occurrence is available for coding and UTR variants that:</p>
            <List>
              <ListItem>Occur in the same gene</ListItem>
              <ListItem>Appear in gnomAD exome samples</ListItem>
              <ListItem>Have a global allele frequency &le; 5%</ListItem>
            </List>

            <VariantCooccurrenceVariantIdsForm
              datasetId={datasetId}
              defaultValues={variantIds}
              onSubmit={newVariantIds => {
                history.push({
                  ...location,
                  search: queryString.stringify({
                    variant: newVariantIds,
                    dataset: datasetId,
                  }),
                })
              }}
            />
          </Section>

          {variantIds.length === 2 && (
            <VariantCoocurrenceContainer datasetId={datasetId} variantIds={variantIds} />
          )}
        </>
      ) : (
        <StatusMessage>
          Variant co-occurrence is only available for gnomAD v2.1.1
          <br />
          <br />
          <Link to={`${location.pathname}?dataset=gnomad_r2_1`} preserveSelectedDataset={false}>
            View variant co-occurrence in gnomAD v2.1.1
          </Link>
        </StatusMessage>
      )}
    </Page>
  )
}

VariantCoocurrencePage.propTypes = {
  datasetId: PropTypes.string.isRequired,
}

export default VariantCoocurrencePage