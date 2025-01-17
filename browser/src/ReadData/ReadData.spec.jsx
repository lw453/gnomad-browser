import React from 'react'
import { Router } from 'react-router'
import renderer from 'react-test-renderer'
import { createBrowserHistory } from 'history'

import { readsApiOutputFactory, exomeReadApiOutputFactory } from '../__factories__/ReadData'
import ReadDataContainer from './ReadData'
import { allDatasetIds } from '../datasets'

const variantId = '123-45-A-G'

jest.mock('../../../graphql-api/src/cache', () => ({
  withCache: (wrappedFunction) => wrappedFunction,
}))

let mockGraphqlResponse = undefined

const mockEndpoints = {
  '/reads/': readsApiOutputFactory.params({
    variant_0: { exome: exomeReadApiOutputFactory.buildList(1) },
  }),
}

jest.mock('../Query', () => ({
  BaseQuery: ({ children, url }) => {
    const mockEndpoint = mockEndpoints[url]
    if (mockEndpoint) {
      const result = mockEndpoint.build()
      mockGraphqlResponse = { data: result }
      return children(mockGraphqlResponse)
    } else {
      throw `mocked BaseQuery got unexpected URL "${url}"`
    }
  },
}))

jest.mock('./IGVBrowser', () => () => null)

describe.each(allDatasetIds)('ReadData with "%s" dataset selected', (datasetId) => {
  test('has no unexpected changes', () => {
    const tree = renderer.create(
      <Router history={createBrowserHistory()}>
        <ReadDataContainer datasetId={datasetId} variantIds={[variantId]} />
      </Router>
    )
    expect(tree).toMatchSnapshot()
  })
})
