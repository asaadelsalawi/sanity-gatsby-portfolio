export default {
  widgets: [
    {
      name: 'sanity-tutorials',
      options: {
        templateRepoId: 'sanity-io/sanity-template-gatsby-portfolio'
      }
    },
    {name: 'structure-menu'},
    {
      name: 'project-info',
      options: {
        __experimental_before: [
          {
            name: 'netlify',
            options: {
              description:
                'NOTE: Because these sites are static builds, they need to be re-deployed to see the changes when documents are published.',
              sites: [
                {
                  buildHookId: '5d6ad4e8dbdf1f366504f949',
                  title: 'Sanity Studio',
                  name: 'sanity-gatsby-portfolio-studio-avcooh73',
                  apiId: 'c67d4770-28ab-4a59-9d30-e30bc924b994'
                },
                {
                  buildHookId: '5d6ad4e80c2e32372ec25df2',
                  title: 'Portfolio Website',
                  name: 'sanity-gatsby-portfolio-web-r1u5ag68',
                  apiId: '578cc85c-8d86-4432-b367-69e0b945ec1f'
                }
              ]
            }
          }
        ],
        data: [
          {
            title: 'GitHub repo',
            value: 'https://github.com/asaadelsalawi/sanity-gatsby-portfolio',
            category: 'Code'
          },
          {
            title: 'Frontend',
            value: 'https://sanity-gatsby-portfolio-web-r1u5ag68.netlify.com',
            category: 'apps'
          }
        ]
      }
    },
    {name: 'project-users', layout: {height: 'auto'}},
    {
      name: 'document-list',
      options: {title: 'Recent projects', order: '_createdAt desc', types: ['project']},
      layout: {width: 'medium'}
    }
  ]
}
