import React from 'react'
import styled from 'styled-components'
import { Route, Switch } from 'react-router-dom'
import { Help, HelpButton } from '@broad/help'

import GenePage from './GenePage'
import RegionPage from './RegionPage'
import TopBar from './TopBar'

const Root = styled.div`
  display: flex;
  flex-direction: row;
  font-family: Roboto, sans-serif;
  font-size: 12px;
  height: 100%;
  width: 100%;
  background-color: #FAFAFA;;
`

const MainPanel = styled.div`
  width: 100%;
`
const App = () => (
  <Root>
    <MainPanel>
      {/* <TopBar /> */}
      {/* <Route exact path="/" component={GenePage} /> */}
      <Switch>
        {/* <Route path="/gene/:gene/:variantId" component={GenePage} /> */}
        <Route exact path="/gene/:gene" component={GenePage} />
        <Route exact path="/region/:regionId" component={RegionPage} />
      </Switch>
      {/* <Route path="/variant/:variant" component={GenePage} /> */}
      {/* <Route path="/rsid/:rsid" component={GenePage} /> */}
    </MainPanel>
    <Help index={'gnomad_help'} />
    <HelpButton />
  </Root>
)

export default App

// :root {
//   --backgroundColor: #FAFAFA;
//   /*--primaryColor: #375D81;*/
//   --primaryColor: black;
//   --secondaryColor: #91AA9D;
//   --exonColor: #475453;
//   --paddingColor: #183152;
//   --rowHoverColor: #E8EAF6;
//   --rowBackGroundColor: #FAFAFA;
// }
//
// /*:root {
//   --backgroundColor: #1E1E20;
//   --primaryColor: #D9CB9E;
//   --secondaryColor: #DC3522;
//   --exonColor: #475453;
//   --paddingColor: #5A5E5C;
//   --rowHoverColor: #183152;
//   --rowBackGroundColor: #1E1E20;
// }*/
