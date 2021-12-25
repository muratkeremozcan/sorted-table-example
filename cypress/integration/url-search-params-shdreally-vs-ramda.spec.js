/// <reference types="cypress" />
import { construct, invoke, pipe, really } from 'cypress-should-really'
const { _, $, R } = Cypress

describe('how to use cy.location', () => {
  it('To get window.location, use the cy.location() command', () => {
    cy.visit('https://example.cypress.io/commands/location')

    cy.location().should((location) => {
      expect(location.hash).to.be.empty
      expect(location.href).to.eq(
        'https://example.cypress.io/commands/location',
      )
      expect(location.host).to.eq('example.cypress.io')
      expect(location.hostname).to.eq('example.cypress.io')
      expect(location.origin).to.eq('https://example.cypress.io')
      expect(location.pathname).to.eq('/commands/location')
      expect(location.port).to.eq('')
      expect(location.protocol).to.eq('https:')
      expect(location.search).to.be.empty
    })
  })

  it('You can pass an argument to return just the part you are interested in', () => {
    cy.visit('https://example.cypress.io/commands/location?search=value#top')

    cy.location('hash').should('eq', '#top')
    cy.location('href').should(
      'eq',
      'https://example.cypress.io/commands/location?search=value#top',
    )
    cy.location('host').should('eq', 'example.cypress.io')
    cy.location('hostname').should('eq', 'example.cypress.io')
    cy.location('origin').should('eq', 'https://example.cypress.io')
    cy.location('pathname').should('eq', '/commands/location')
    cy.location('port').should('be.empty')
    cy.location('protocol').should('eq', 'https:')

    // KEY: distinctions
    cy.location('search').should('eq', '?search=value')
    cy.location('search').should('include', '?search')
    cy.location('search').should('include', '=value')
    cy.location('hash').should('eq', '#top')
  })

  it('If you want to check a specific value inside the search part of the URL, use the browser built-in object URLSearchParams', () => {
    cy.visit(
      'https://example.cypress.io/commands/location?search=value&id=1234',
    )

    cy.location('search')
      .should('eq', '?search=value&id=1234')
      .then((s) => new URLSearchParams(s))
      .as('searchParams') // parse the search value
      .invoke('get', 'id')
      .should('eq', '1234')

    cy.get('@searchParams').invoke('get', 'search').should('eq', 'value')
  })

  it('We can convert the URLSearchParams into a plain object using the bundled Lodash function', () => {
    cy.visit(
      'https://example.cypress.io/commands/location?search=value&id=1234',
    )

    cy.location('search').should((search) => {
      // get a plain object from the search string, make an array and convert to object
      const parsed = new URLSearchParams(search)
      const pairs = Array.from(parsed.entries()) // make the array - .entries() is optional
      const plain = _.fromPairs(pairs) // convert to object

      expect(plain).to.deep.eq({
        search: 'value',
        id: '1234',
      })
    })
  })
})

describe('FP', () => {
  context('basic: with helper fn', () => {
    function searchToPlain_original(search) {
      const parsed = new URLSearchParams(search)
      const pairs = Array.from(parsed.entries())
      const plain = _.fromPairs(pairs)
      return plain

      // KEY: every time the value assignment chain happens, the composition pattern is reveals itself
      // return _.fromPairs(
      //   Array.from(new URLSearchParams(search).entries()),
      // )
    }

    it('Using util function', () => {
      cy.visit(
        'https://example.cypress.io/commands/location?search=value&id=1234',
      )

      cy.location('search').should((search) => {
        expect(searchToPlain_original(search)).to.deep.equal({
          search: 'value',
          id: '1234',
        })
      })
    })
  })

  context('using cypress-should-really', () => {
    const searchToPlain = pipe(
      construct(URLSearchParams), // string
      invoke('entries'), // Iterable<[string, string]>
      Array.from, // Array<[string, string]>
      _.fromPairs, // { [key: string]: string }
    )

    // the pipe takes all individual unary functions and creates a pipeline function
    // that just waits for the data from the cy.location(‘search’) command

    it('(sub step that explains the transition)', () => {
      cy.visit(
        'https://example.cypress.io/commands/location?search=value&id=1234',
      )

      cy.location('search').should((search) => {
        expect(searchToPlain(search)).to.deep.equal({
          search: 'value',
          id: '1234',
        })
      })
    })

    // Piping the data through a series of functions to be fed to the assertion expect(...).to Chai chainer is so common,
    // that cypress-should-really has a ... helper for this.
    // If you want to transform the data and run it through a Chai assertion use really function.
    // It constructs a should(callback) for you:

    it('Using really helper', () => {
      cy.visit(
        'https://example.cypress.io/commands/location?search=value&id=1234',
      )

      cy.location('search').should(
        really(searchToPlain, 'deep.equal', {
          search: 'value',
          id: '1234',
        }),
      )
    })
  })

  context('using Ramda', () => {
    const searchToPlain_R = R.pipe(
      R.constructN(1, URLSearchParams), // string , note that tis isn't interchangeable with R.construct(URLSearchParams)
      R.invoker(0, 'entries'), // Iterable<[string, string]>
      Array.from, // Array<[string, string]>
      _.fromPairs, //  { [key: string]: string }
    )

    it('Ramda is a bit more verbose that should really, and the really syntax enables even further conciseness', () => {
      cy.visit(
        'https://example.cypress.io/commands/location?search=value&id=1234',
      )

      cy.location('search').should((search) => {
        expect(searchToPlain_R(search)).to.deep.equal({
          search: 'value',
          id: '1234',
        })
      })

      // use really from cypress-should-really
      cy.location('search').should(
        really(searchToPlain_R, 'deep.equal', {
          search: 'value',
          id: '1234',
        }),
      )
    })
  })
})
