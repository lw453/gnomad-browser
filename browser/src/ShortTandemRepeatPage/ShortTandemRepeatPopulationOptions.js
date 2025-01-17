import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import { Select } from '@gnomad/ui'

import { GNOMAD_POPULATION_NAMES } from '@gnomad/dataset-metadata/gnomadPopulations'

const Wrapper = styled.div`
  @media (max-width: 600px) {
    display: flex;
    flex-direction: column;
    align-items: center;

    label:first-child {
      margin-bottom: 1em;
    }
  }
`

const ShortTandemRepeatPopulationOptions = ({
  id,
  populationIds,
  selectedPopulationId,
  onSelectPopulationId,
}) => {
  const selectedAncestralPopulation =
    selectedPopulationId === 'XX' || selectedPopulationId === 'XY'
      ? ''
      : selectedPopulationId.split('_')[0]

  let selectedSex = ''
  if (selectedPopulationId.endsWith('XX')) {
    selectedSex = 'XX'
  } else if (selectedPopulationId.endsWith('XY')) {
    selectedSex = 'XY'
  }

  return (
    <Wrapper>
      <label htmlFor={`short-tandem-repeat-${id}-population-options-population`}>
        Population:{' '}
        <Select
          id={`short-tandem-repeat-${id}-population-options-population`}
          value={selectedAncestralPopulation}
          onChange={e => {
            onSelectPopulationId([e.target.value, selectedSex].filter(Boolean).join('_'))
          }}
        >
          <option value="">Global</option>
          {populationIds
            .filter(popId => !(popId.endsWith('XX') || popId.endsWith('XY')))
            .sort((pop1, pop2) =>
              GNOMAD_POPULATION_NAMES[pop1].localeCompare(GNOMAD_POPULATION_NAMES[pop2])
            )
            .map(popId => (
              <option key={popId} value={popId}>
                {GNOMAD_POPULATION_NAMES[popId]}
              </option>
            ))}
        </Select>
      </label>{' '}
      <label htmlFor={`short-tandem-repeat-${id}-population-options-sex`}>
        Sex:{' '}
        <Select
          id={`short-tandem-repeat-${id}-population-options-sex`}
          value={selectedSex}
          onChange={e => {
            onSelectPopulationId(
              [selectedAncestralPopulation, e.target.value].filter(Boolean).join('_')
            )
          }}
        >
          <option value="">All</option>
          <option value="XX">XX</option>
          <option value="XY">XY</option>
        </Select>
      </label>
    </Wrapper>
  )
}

ShortTandemRepeatPopulationOptions.propTypes = {
  id: PropTypes.string.isRequired,
  populationIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedPopulationId: PropTypes.string.isRequired,
  onSelectPopulationId: PropTypes.func.isRequired,
}

export default ShortTandemRepeatPopulationOptions
