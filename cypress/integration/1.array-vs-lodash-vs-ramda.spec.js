const { _, R } = Cypress
function square(n) {
  return n * n
}

it('array.map(fn) vs _.map(array, fn) vs R.map(fn, array)', () => {
  // array.map(fn)
  cy.wrap([4, 8].map(square)).should('deep.eq', [16, 64])

  // _.map(array, fn)
  cy.wrap(_.map([4, 8], square)).should('deep.eq', [16, 64])

  cy.wrap(R.map(square, [4, 8])).should('deep.eq', [16, 64])
})

it('object comparison: lodash maps over values automatically', () => {
  // no mapping over objects for array.map, so convert to array with Object.values
  cy.wrap(Object.values({ a: 4, b: 8 }).map(square)).should('deep.eq', [16, 64])

  // one advantage of lodash map is being able to map over objects
  cy.wrap(_.map({ a: 4, b: 8 }, square)).should('deep.eq', [16, 64])

  // similar to array.map situation with R.map, so convert to array with Object.values
  cy.wrap(R.map(square, Object.values({ a: 4, b: 8 }))).should(
    'deep.eq',
    [16, 64],
  )
})

it(`KEY: the _.property iteratee shorthand is useful, esp when working with jQuery, 
R.map(R.prop(..),arr) does a similar thing`, () => {
  const arr = [{ user: 'barney' }, { user: 'fred' }]

  cy.wrap(arr.map((i) => i.user)).should('deep.eq', ['barney', 'fred'])

  cy.wrap(_.map(arr, 'user')).should('deep.eq', ['barney', 'fred'])

  // looks meh at first with Ramda
  cy.wrap(R.map((i) => i.user, arr)).should('deep.eq', ['barney', 'fred'])
  // but you can make it better
  cy.wrap(R.map(R.prop('user'), arr)).should('deep.eq', ['barney', 'fred'])
})

context('check if a key value pair exists in an object', () => {
  const store = {
    accountId: 'e41de71a-8f5c-423f-945b-33c3c7fa776d',
    address: {
      address1: '799 Crystel Common',
      address2: 'Apt. 790',
      city: 'Apex',
      country: 'New Caledonia',
      countryCode: 'EG',
      province: 'North Dakota',
      provinceCode: 'OR',
      zipCode: '84837-5370',
    },
    annualSales: 64642,
    approved: true,
    branding: {
      primaryColor: '#000000',
      fontUrl: 'http://tiny.cc/n3ft8y',
      font: 'Comic Sans',
    },
    createdAt: 1640788366637,
    currencyCode: 'USD',
    domain: 'douglas.info',
    enabled: true,
    generateLeadsEnabled: true,
    id: '78fd7638-a2a2-4e2c-8c9d-0946b72be3a8',
    logoUrl: null,
    name: 'Harvey, Zulauf and Carter',
    phoneNumbers: [],
    platform: 'shopify',
    platformMetaData: {
      platformCreatedAt: 1640788365850,
      platformPlanName: 'ShopifyPro',
      platformStoreName: 'Moore and Sons',
      platformUpdatedAt: 1640788365850,
    },
    storeType: 'Steel',
    updatedAt: 1640788367429,
  }

  it('easier way to check if a prop exists in an object using key in obj', () => {
    const keyValueExists = (key, value, obj) => key in obj && obj[key] === value

    cy.wrap(keyValueExists('currencyCode', 'USD', store)).should('eq', true)
    cy.wrap(keyValueExists('platform', 'shopify', store)).should('eq', true)

    cy.wrap(keyValueExists('currencyCode', 'CAD', store)).should('eq', false)
    cy.wrap(keyValueExists('foo', 'bar', store)).should('eq', false)
  })

  it('checking deep key value pairs in an object, we can use _.has and _.get', () => {
    const deepKeyValueExists = (key, value, obj) =>
      _.has(obj, key) && _.get(obj, key) === value

    cy.wrap(deepKeyValueExists('currencyCode', 'USD', store)).should('eq', true)
    cy.wrap(deepKeyValueExists('address.countryCode', 'EG', store)).should(
      'eq',
      true,
    )
  })
})
