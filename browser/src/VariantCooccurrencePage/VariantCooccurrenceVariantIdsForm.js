import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { isVariantId } from '@gnomad/identifiers'
import { Input, PrimaryButton } from '@gnomad/ui'

import { referenceGenomeForDataset } from '../datasets'

const InputGroup = styled.div`
  margin-bottom: 1em;
`

const FormValidationMessage = styled.span`
  display: inline-block;
  margin-top: 0.5em;
  color: #ff583f;
`

const SubmitButton = styled(PrimaryButton).attrs({ type: 'submit' })``

const VariantCoocurrenceVariantIdsForm = ({ datasetId, defaultValues, onSubmit }) => {
  const [variant1Id, setVariant1Id] = useState(defaultValues[0] || '')
  const [variant2Id, setVariant2Id] = useState(defaultValues[1] || '')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setSubmitted(false)
  }, [variant1Id, variant2Id])

  let variant1ValidationError = null
  if (variant1Id) {
    if (!isVariantId(variant1Id)) {
      variant1ValidationError =
        'Variants must be specified as chromosome-position-reference-alternate'
    } else if (variant2Id && variant1Id === variant2Id) {
      variant1ValidationError = 'Two different variants must be provided'
    }
  }
  const isVariant1Invalid = Boolean(variant1ValidationError)

  let variant2ValidationError = null
  if (variant2Id) {
    if (!isVariantId(variant2Id)) {
      variant2ValidationError =
        'Variants must be specified as chromosome-position-reference-alternate'
    } else if (variant1Id && variant2Id === variant1Id) {
      variant2ValidationError = 'Two different variants must be provided'
    }
  }
  const isVariant2Invalid = Boolean(variant2ValidationError)

  return (
    <form
      onSubmit={e => {
        e.preventDefault()

        setSubmitted(true)
        onSubmit([variant1Id, variant2Id])
      }}
    >
      <InputGroup>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label htmlFor="cooccurrence-variant1" style={{ display: 'block' }}>
          Variant 1 (required)
          <Input
            aria-describedby={isVariant1Invalid ? 'cooccurrence-variant1-error' : undefined}
            id="cooccurrence-variant1"
            placeholder={`chromosome-position-reference-alternate (${referenceGenomeForDataset(
              datasetId
            )})`}
            required
            value={variant1Id}
            onChange={e => {
              setVariant1Id(e.target.value)
            }}
          />
        </label>
        {isVariant1Invalid && (
          <FormValidationMessage id="cooccurrence-variant1-error">
            {variant1ValidationError}
          </FormValidationMessage>
        )}
      </InputGroup>
      <InputGroup>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label htmlFor="cooccurrence-variant2" style={{ display: 'block' }}>
          Variant 2 (required)
          <Input
            aria-describedby={isVariant2Invalid ? 'cooccurrence-variant2-error' : undefined}
            id="cooccurrence-variant2"
            placeholder={`chromosome-position-reference-alternate (${referenceGenomeForDataset(
              datasetId
            )})`}
            required
            value={variant2Id}
            onChange={e => {
              setVariant2Id(e.target.value)
            }}
          />
        </label>
        {isVariant2Invalid && (
          <FormValidationMessage id="cooccurrence-variant2-error">
            {variant2ValidationError}
          </FormValidationMessage>
        )}
      </InputGroup>

      <SubmitButton
        disabled={!variant1Id || !variant2Id || isVariant1Invalid || isVariant2Invalid || submitted}
      >
        Submit
      </SubmitButton>
    </form>
  )
}

VariantCoocurrenceVariantIdsForm.propTypes = {
  datasetId: PropTypes.string.isRequired,
  defaultValues: PropTypes.arrayOf(PropTypes.string),
  onSubmit: PropTypes.func.isRequired,
}

VariantCoocurrenceVariantIdsForm.defaultProps = {
  defaultValues: [],
}

export default VariantCoocurrenceVariantIdsForm
