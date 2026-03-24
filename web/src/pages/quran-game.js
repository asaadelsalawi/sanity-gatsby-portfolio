import React from 'react'
import Layout from '../containers/layout'
import SEO from '../components/seo'
import Container from '../components/container'
import QuranGame from '../components/quran-game'

const QuranGamePage = () => (
  <Layout>
    <SEO
      title='Quran Word Game'
      keywords={['quran', 'arabic', 'learning', 'vocabulary', 'islam']}
    />
    <Container>
      <QuranGame />
    </Container>
  </Layout>
)

export default QuranGamePage
