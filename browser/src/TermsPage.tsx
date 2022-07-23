import React from 'react'

import { PageHeading } from '@gnomad/ui'

// @ts-expect-error TS(2307) FIXME: Cannot find module '../about/terms.md' or its corr... Remove this comment to see the full error message
import termsContent from '../about/terms.md'

import DocumentTitle from './DocumentTitle'
import InfoPage from './InfoPage'
import MarkdownContent from './MarkdownContent'

export default () => (
  <InfoPage>
    <DocumentTitle title="Terms and Data Information" />
    <PageHeading>Terms and Data Information</PageHeading>

    <MarkdownContent dangerouslySetInnerHTML={{ __html: termsContent.html }} />
  </InfoPage>
)
