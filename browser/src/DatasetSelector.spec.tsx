import { describe, expect, test } from '@jest/globals'

import React from 'react'
import { Router } from 'react-router'
import renderer from 'react-test-renderer'
import { createBrowserHistory } from 'history'
import DatasetSelector from './DatasetSelector'

import { allDatasetIds } from './datasets'

describe.each(allDatasetIds)('DataSelector with "%s" dataset selected', (datasetId: any) => {
  test('has no unexpected changes', () => {
    const tree = renderer.create(
      // @ts-expect-error TS(2786) FIXME: 'Router' cannot be used as a JSX component.
      <Router history={createBrowserHistory()}>
        {/* @ts-expect-error TS(2786) FIXME: 'DatasetSelector' cannot be used as a JSX componen... Remove this comment to see the full error message */}
        <DatasetSelector selectedDataset={datasetId} datasetOptions={{}} />
      </Router>
    )
    expect(tree).toMatchSnapshot()
  })
})
