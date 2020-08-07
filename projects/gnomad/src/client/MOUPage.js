import React from 'react'
import styled from 'styled-components'

import { Button, OrderedList as BaseOrderedList, ListItem } from '@gnomad/ui'

import DocumentTitle from './DocumentTitle'
import InfoPage from './InfoPage'

const MOUHeading = styled.h1`
  text-align: center;

  @media print {
    font-size: 16pt; /* stylelint-disable-line */
  }
`

const PrintButton = styled(Button)`
  margin-top: 2em;

  @media print {
    display: none;
  }
`

const OrderedList = styled(BaseOrderedList)`
  list-style-type: decimal;
`

export default () => (
  <InfoPage>
    <DocumentTitle title="Memorandum of Understanding" />
    <MOUHeading>
      <span style={{ textTransform: 'uppercase' }}>Memorandum of Understanding</span>
      <br />
      Participation in the Genome Aggregation Database (gnomAD)
    </MOUHeading>

    <p>
      The objective of the Genome Aggregation Database Consortium (&ldquo;the Consortium&rdquo;)
      encompasses the collection of exome sequencing data (through an effort previously known as the
      Exome Aggregation Consortium or ExAC) as well as whole-genome sequencing data, and to apply
      variant calling to such data from tens of thousands of samples. The purpose of this Memorandum
      of Understanding (&ldquo;MOU&rdquo;) is to codify the terms of participation for researchers
      who have contributed individual sequencing data to the Consortium (&ldquo;Participant&rdquo;).
      By signing this MOU, participants agree to the following principles:
    </p>

    <OrderedList>
      <ListItem>
        Participant will provide exome and/or genome sequencing data and information on sample
        case/control status, age, sex and ancestry (&ldquo;Data&rdquo;) to The Broad Institute, Inc.
        (&ldquo;Broad&rdquo;) for use by the Consortium.
      </ListItem>
      <ListItem>
        Participant certifies that it has the right to provide the Data to Broad for Consortium use
        and that the use complies with all applicable ethical regulations including those imposed by
        the US OHRP, NIH and other national policy organizations.
      </ListItem>
      <ListItem>
        Broad shall use the Data solely for the creation of frequency reference databases and for no
        other purpose without Participant’s prior written consent.
      </ListItem>
      <ListItem>
        Broad will not transfer genotype data – either the sequence data provided by Participant, or
        individual genotypes – to any third party without Participant’s prior written consent.
      </ListItem>
      <ListItem>
        Broad agrees to use the Data in compliance with all applicable regulations, including NIH
        regulations and guidelines.
      </ListItem>
      <ListItem>
        Broad will aggregate the Data together with exome/genome data from other participants and
        perform simultaneous variant calling (joint calling) across the full data set.
      </ListItem>
      <ListItem>
        Upon conclusion of each round of joint calling, Broad will provide a summary of the Results
        to all Participants. The term &ldquo;Results&rdquo; include (1) new variant and genotype
        calls for the samples provided by Participant to be made available on request; and (2) a
        summary file containing a list of variant sites, allele frequencies, and gene-level
        summaries, generated from all samples in the project will be automatically returned to all
        Participants.
      </ListItem>
      <ListItem>
        Broad will make the Results available through a freely accessible online portal, which will
        allow querying of specific genes/variants and allow the complete download of the complete
        summary file in computer-readable format. No individual genotype or sequence data will be
        available from this portal.
      </ListItem>
      <ListItem>
        Any Results delivered pursuant to this Agreement are understood to be experimental in nature
        and provided &ldquo;as is.&rdquo; Broad makes no representations and extends no warranties
        of any kind regarding the Results.
      </ListItem>
      <ListItem>
        Publicly released data will be accompanied by a usage statement that permits free use and
        publication of Consortium frequency data.
      </ListItem>
      <ListItem>
        No Participant shall use the name or any trademark owned by Broad or another Participant in
        any promotional material or other public announcement or disclosure without the prior
        written consent of the owner of the name or mark in question. In the case of Broad, prior
        written consent is to be given by its Office of Communications.
      </ListItem>
      <ListItem>
        Participants in this MOU are not limited in any way in the use and publication of their own
        data.
      </ListItem>
      <ListItem>
        The genetic information described here may be hosted on an access controlled platform
        developed and managed by the Broad on a public cloud compute and storage environment. Google
        Cloud Compute environment is a highly secured environment that undergoes several independent
        third party audits on a regular basis to provide independent verification of security,
        privacy and compliance controls and is accredited with a FISMA moderate security level. In
        the future, Broad may use other cloud storage vendors that have equivalent security measures
        to host these data.
      </ListItem>
    </OrderedList>

    <p>You indicate your agreement with this MOU by signing below:</p>

    <dl>
      <dt style={{ textTransform: 'uppercase' }}>Participant:</dt>
      <dd style={{ marginLeft: 0 }}>
        <br />
        <span aria-hidden="true">____________________________</span>
      </dd>
      <dt>Consortium:</dt>
      <dd />
      <dt>Name:</dt>
      <dd />
      <dt>Title:</dt>
      <dd />
      <dt>Date:</dt>
      <dd />
    </dl>

    <PrintButton
      onClick={() => {
        window.print()
      }}
    >
      Print this page
    </PrintButton>
  </InfoPage>
)
