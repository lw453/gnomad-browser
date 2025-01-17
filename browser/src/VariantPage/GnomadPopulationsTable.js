import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

import { Checkbox } from '@gnomad/ui'

import { GNOMAD_POPULATION_NAMES } from '@gnomad/dataset-metadata/gnomadPopulations'

import { PopulationsTable } from './PopulationsTable'

const ControlSection = styled.div`
  margin-top: 1em;

  label {
    margin-left: 1em;
  }
`

/**
 * Merge frequency information for multiple populations with the same ID.
 * This is used to add exome and genome population frequencies.
 *
 * @param {Object[]} populations Array of populations.
 */
const mergePopulations = populations => {
  const indices = {}
  const merged = []

  for (let i = 0; i < populations.length; i += 1) {
    const pop = populations[i]

    const popIndex = indices[pop.id]
    if (popIndex === undefined) {
      merged.push({ ...pop })
      indices[pop.id] = merged.length - 1
    } else {
      merged[popIndex].ac += pop.ac
      merged[popIndex].an += pop.an
      if (pop.ac_hemi !== null) {
        merged[popIndex].ac_hemi += pop.ac_hemi
      }
      merged[popIndex].ac_hom += pop.ac_hom
    }
  }

  return merged
}

const addPopulationNames = populations => {
  return populations.map(pop => {
    let name
    if (pop.id === 'XX' || pop.id.endsWith('_XX')) {
      name = 'XX'
    } else if (pop.id === 'XY' || pop.id.endsWith('_XY')) {
      name = 'XY'
    } else {
      name = GNOMAD_POPULATION_NAMES[pop.id.toLowerCase()] || pop.id
    }
    return { ...pop, name }
  })
}

const nestPopulations = populations => {
  const popIndices = []
  const subpopulations = {}

  for (let i = 0; i < populations.length; i += 1) {
    const pop = populations[i]

    // IDs are one of:
    // * pop
    // * pop_subpop
    // * pop_sex
    // * sex
    const divisions = pop.id.split('_')
    if (divisions.length === 1) {
      popIndices.push(i)
    } else {
      const parentPop = divisions[0]
      if (subpopulations[parentPop] === undefined) {
        subpopulations[parentPop] = [{ ...pop }]
      } else {
        subpopulations[parentPop].push({ ...pop })
      }
    }
  }

  return popIndices.map(index => {
    const pop = populations[index]
    return {
      ...pop,
      subpopulations: subpopulations[pop.id],
    }
  })
}

export class GnomadPopulationsTable extends Component {
  static propTypes = {
    datasetId: PropTypes.string.isRequired,
    exomePopulations: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        ac: PropTypes.number.isRequired,
        an: PropTypes.number.isRequired,
        ac_hemi: PropTypes.number,
        ac_hom: PropTypes.number.isRequired,
      })
    ).isRequired,
    genomePopulations: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        ac: PropTypes.number.isRequired,
        an: PropTypes.number.isRequired,
        ac_hemi: PropTypes.number,
        ac_hom: PropTypes.number.isRequired,
      })
    ).isRequired,
    showHemizygotes: PropTypes.bool,
    showHomozygotes: PropTypes.bool,
  }

  static defaultProps = {
    showHemizygotes: true,
    showHomozygotes: true,
  }

  constructor(props) {
    super(props)

    this.state = {
      includeExomes: props.exomePopulations.length !== 0,
      includeGenomes: props.genomePopulations.length !== 0,
    }
  }

  render() {
    const {
      datasetId,
      exomePopulations,
      genomePopulations,
      showHemizygotes,
      showHomozygotes,
    } = this.props
    const { includeExomes, includeGenomes } = this.state

    let includedPopulations = []
    if (includeExomes) {
      includedPopulations = includedPopulations.concat(exomePopulations)
    }
    if (includeGenomes) {
      includedPopulations = includedPopulations.concat(genomePopulations)
    }

    let populations = nestPopulations(addPopulationNames(mergePopulations(includedPopulations)))
    if (datasetId.startsWith('gnomad_r2_1') && includeGenomes) {
      populations = populations.map(pop => {
        if (pop.id === 'eas') {
          // If the variant is only present in genomes, sub-continental populations won't be present at all.
          if (pop.subpopulations.length === 2) {
            ;['jpn', 'kor', 'oea'].forEach(subPopId => {
              pop.subpopulations.push({
                id: `eas_${subPopId}`,
                name: GNOMAD_POPULATION_NAMES[`eas_${subPopId}`],
                ac: 0,
                an: 0,
                ac_hemi: 0,
                ac_hom: 0,
              })
            })
          }

          pop.subpopulations.forEach(subPop => {
            if (!(subPop.id.endsWith('XX') || subPop.id.endsWith('XY'))) {
              subPop.name += ' *' // eslint-disable-line no-param-reassign
            }
          })
        }
        return pop
      })
    }

    return (
      <>
        <PopulationsTable
          populations={populations}
          showHemizygotes={showHemizygotes}
          showHomozygotes={showHomozygotes}
        />
        {datasetId.startsWith('gnomad_r2_1') && includeGenomes && (
          <p>
            * Allele frequencies for some sub-continental populations were not computed for genome
            samples.
          </p>
        )}
        {showHemizygotes && <p>Hemizygote counts are not available for subpopulations.</p>}
        <ControlSection>
          Include:
          <Checkbox
            checked={includeExomes}
            disabled={exomePopulations.length === 0 || (includeExomes && !includeGenomes)}
            id="includeExomePopulations"
            label="Exomes"
            onChange={value => {
              this.setState({ includeExomes: value })
            }}
          />
          <Checkbox
            checked={includeGenomes}
            disabled={genomePopulations.length === 0 || (!includeExomes && includeGenomes)}
            id="includeGenomePopulations"
            label="Genomes"
            onChange={value => {
              this.setState({ includeGenomes: value })
            }}
          />
        </ControlSection>
      </>
    )
  }
}
