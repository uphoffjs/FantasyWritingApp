# Variables and Aliases

## Understanding Cypress's Asynchronous Nature

Cypress commands are asynchronous and return chainable objects, not direct values. Understanding this concept is crucial for proper variable usage and data handling.

### The Asynchronous Command Queue

```javascript
// ❌ WRONG: This won't work as expected
describe('Incorrect Variable Usage', () => {
  it('demonstrates common mistakes', () => {
    // This doesn't work - cy.get() returns a Cypress chainable, not the element
    const button = cy.get('[data-cy="save-button"]')
    button.click() // This won't work

    // This doesn't work - you can't extract values synchronously
    let storyTitle
    cy.get('[data-cy="story-title"]').then(($el) => {
      storyTitle = $el.text()
    })
    // storyTitle is undefined here because the command hasn't executed yet
    cy.log(storyTitle) // undefined

    // This doesn't work - attempting to use values outside the command chain
    const stories = []
    cy.get('[data-cy="story-item"]').each(($el) => {
      stories.push($el.text())
    })
    // stories array is empty here
    expect(stories).to.have.length.greaterThan(0) // Will fail
  })
})

// ✅ CORRECT: Proper asynchronous handling
describe('Correct Variable Usage', () => {
  it('demonstrates proper async handling', () => {
    // Chain commands properly
    cy.get('[data-cy="save-button"]').click()

    // Use .then() to work with values
    cy.get('[data-cy="story-title"]').then(($el) => {
      const storyTitle = $el.text()
      cy.log(`Story title: ${storyTitle}`)
      
      // Continue chaining within .then()
      if (storyTitle.includes('Draft')) {
        cy.get('[data-cy="publish-button"]').click()
      }
    })

    // Proper array handling
    cy.get('[data-cy="story-item"]').then(($elements) => {
      const stories = Array.from($elements, el => el.textContent)
      expect(stories).to.have.length.greaterThan(0)
    })
  })
})
```

## Working with Aliases

Aliases provide a way to store and reuse values, elements, and network requests throughout your tests.

### Element Aliases

```javascript
describe('Element Aliases', () => {
  beforeEach(() => {
    cy.visit('/stories')
    
    // * Create aliases for frequently used elements
    cy.get('[data-cy="story-form"]').as('storyForm')
    cy.get('[data-cy="character-section"]').as('characterSection')
    cy.get('[data-cy="save-button"]').as('saveButton')
  })

  it('uses element aliases', () => {
    // * Access aliased elements with @
    cy.get('@storyForm').within(() => {
      cy.get('[data-cy="title-input"]').type('My Epic Tale')
      cy.get('[data-cy="content-input"]').type('Once upon a time...')
    })

    cy.get('@characterSection').within(() => {
      cy.get('[data-cy="add-character-button"]').click()
      cy.get('[data-cy="character-name-input"]').type('Aragorn')
    })

    cy.get('@saveButton').click()
    
    // ? Verify save success
    cy.get('[data-cy="success-message"]').should('be.visible')
  })

  it('reuses aliases across tests', () => {
    // Aliases are available in all tests within the same describe block
    cy.get('@storyForm').should('be.visible')
    cy.get('@saveButton').should('be.enabled')
  })

  it('handles dynamic aliases', () => {
    // * Create aliases conditionally
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="premium-features"]').length > 0) {
        cy.get('[data-cy="premium-features"]').as('premiumSection')
        cy.get('@premiumSection').should('be.visible')
      }
    })
  })
})
```

### Value Aliases

```javascript
describe('Value Aliases', () => {
  beforeEach(() => {
    cy.visit('/stories/new')
  })

  it('stores and reuses values', () => {
    // * Store text values
    cy.get('[data-cy="story-title-input"]')
      .invoke('val')
      .as('originalTitle')

    cy.get('[data-cy="story-title-input"]')
      .clear()
      .type('New Title')

    // Use stored value later
    cy.get('@originalTitle').then((originalTitle) => {
      cy.log(`Original title was: ${originalTitle}`)
      
      // Can use in assertions
      expect(originalTitle).to.not.equal('New Title')
    })

    // * Store computed values
    cy.get('[data-cy="story-content"]')
      .invoke('text')
      .then((text) => {
        const wordCount = text.split(' ').length
        cy.wrap(wordCount).as('wordCount')
      })

    cy.get('@wordCount').should('be.greaterThan', 0)
  })

  it('stores fixture data as aliases', () => {
    // * Load fixture and store as alias
    cy.fixture('stories').as('testStories')
    cy.fixture('characters').as('testCharacters')

    cy.get('@testStories').then((stories) => {
      const firstStory = stories[0]
      
      cy.get('[data-cy="title-input"]').type(firstStory.title)
      cy.get('[data-cy="content-input"]').type(firstStory.content)
    })

    cy.get('@testCharacters').then((characters) => {
      characters.forEach((character, index) => {
        cy.get('[data-cy="add-character-button"]').click()
        cy.get(`[data-cy="character-name-${index}"]`).type(character.name)
      })
    })
  })

  it('stores API response data', () => {
    // * Store intercept response as alias
    cy.intercept('GET', '/api/stories').as('getStories')
    cy.get('[data-cy="load-stories-button"]').click()
    cy.wait('@getStories')

    // Access response data
    cy.get('@getStories').then((interception) => {
      const stories = interception.response.body
      cy.wrap(stories.length).as('storyCount')
      
      // Use the data
      expect(stories).to.be.an('array')
      expect(stories).to.have.length.greaterThan(0)
    })

    cy.get('@storyCount').should('be.greaterThan', 0)
  })
})
```

### Network Request Aliases

```javascript
describe('Network Request Aliases', () => {
  beforeEach(() => {
    // * Set up network intercepts with aliases
    cy.intercept('GET', '/api/stories', { fixture: 'stories.json' }).as('getStories')
    cy.intercept('POST', '/api/stories').as('createStory')
    cy.intercept('PUT', '/api/stories/*').as('updateStory')
    cy.intercept('DELETE', '/api/stories/*').as('deleteStory')
    
    cy.visit('/stories')
  })

  it('waits for and validates network requests', () => {
    // * Wait for initial data load
    cy.wait('@getStories').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
      expect(interception.response.body).to.be.an('array')
    })

    // * Test story creation
    cy.get('[data-cy="create-story-button"]').click()
    cy.get('[data-cy="title-input"]').type('New Story')
    cy.get('[data-cy="save-button"]').click()

    cy.wait('@createStory').then((interception) => {
      expect(interception.request.body).to.include({
        title: 'New Story'
      })
      expect(interception.response.statusCode).to.equal(201)
      
      // ! Store created story ID for later use
      const storyId = interception.response.body.id
      cy.wrap(storyId).as('newStoryId')
    })

    // * Test story update using stored ID
    cy.get('@newStoryId').then((storyId) => {
      cy.visit(`/stories/${storyId}/edit`)
      cy.get('[data-cy="title-input"]').clear().type('Updated Title')
      cy.get('[data-cy="save-button"]').click()

      cy.wait('@updateStory').then((interception) => {
        expect(interception.request.url).to.include(storyId)
        expect(interception.request.body.title).to.equal('Updated Title')
      })
    })
  })

  it('handles network errors with aliases', () => {
    // * Override intercept to simulate error
    cy.intercept('POST', '/api/stories', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('createStoryError')

    cy.get('[data-cy="create-story-button"]').click()
    cy.get('[data-cy="title-input"]').type('Error Test Story')
    cy.get('[data-cy="save-button"]').click()

    cy.wait('@createStoryError').then((interception) => {
      expect(interception.response.statusCode).to.equal(500)
    })

    // ? Verify error handling in UI
    cy.get('[data-cy="error-message"]')
      .should('be.visible')
      .and('contain', 'Failed to save story')
  })

  it('tests multiple sequential requests', () => {
    // * Test workflow with multiple API calls
    cy.get('[data-cy="create-story-button"]').click()
    
    // First request - create story
    cy.get('[data-cy="title-input"]').type('Multi-Step Story')
    cy.get('[data-cy="save-button"]').click()
    cy.wait('@createStory').as('createdStory')

    // Second request - add character
    cy.intercept('POST', '/api/characters').as('createCharacter')
    cy.get('[data-cy="add-character-button"]').click()
    cy.get('[data-cy="character-name"]').type('Hero')
    cy.get('[data-cy="save-character-button"]').click()
    cy.wait('@createCharacter')

    // Third request - publish story
    cy.intercept('PUT', '/api/stories/*/publish').as('publishStory')
    cy.get('[data-cy="publish-button"]').click()
    cy.wait('@publishStory')

    // ? Verify all requests completed successfully
    cy.get('@createdStory').its('response.statusCode').should('eq', 201)
    cy.get('@createCharacter').its('response.statusCode').should('eq', 201)
    cy.get('@publishStory').its('response.statusCode').should('eq', 200)
  })
})
```

## Advanced Variable Patterns

### Closure and Scope Management

```javascript
describe('Closure and Scope Management', () => {
  it('handles closures correctly', () => {
    // * Using function() syntax preserves 'this' context for aliases
    cy.fixture('stories').as('testStories')

    cy.get('@testStories').then(function(stories) {
      // 'this' refers to the test context
      this.firstStory = stories[0]
      
      cy.get('[data-cy="title-input"]').type(this.firstStory.title)
    }).then(function() {
      // Can access this.firstStory in subsequent .then() blocks
      expect(this.firstStory.title).to.be.a('string')
    })

    // ❌ Arrow functions don't preserve 'this' context
    cy.get('@testStories').then((stories) => {
      // this.firstStory would be undefined here
      const firstStory = stories[0] // Use local variable instead
      cy.get('[data-cy="content-input"]').type(firstStory.content)
    })
  })

  it('shares data across multiple commands', () => {
    const testData = {
      stories: [],
      characters: [],
      totalWordCount: 0
    }

    // * Collect story data
    cy.get('[data-cy="story-item"]').each(($el, index) => {
      cy.wrap($el).within(() => {
        cy.get('[data-cy="story-title"]').invoke('text').then((title) => {
          testData.stories.push({ index, title })
        })

        cy.get('[data-cy="word-count"]').invoke('text').then((count) => {
          const words = parseInt(count.replace(/\D/g, ''))
          testData.totalWordCount += words
        })
      })
    }).then(() => {
      // ? Process collected data
      cy.log(`Collected ${testData.stories.length} stories`)
      cy.log(`Total word count: ${testData.totalWordCount}`)
      
      expect(testData.stories).to.have.length.greaterThan(0)
      expect(testData.totalWordCount).to.be.greaterThan(0)
    })
  })
})
```

### Dynamic Variable Creation

```javascript
describe('Dynamic Variable Creation', () => {
  it('creates variables based on application state', () => {
    cy.visit('/stories')

    // * Create aliases based on what's found on page
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="story-item"]').length > 0) {
        cy.get('[data-cy="story-item"]').first().as('firstStory')
        cy.wrap(true).as('hasStories')
      } else {
        cy.wrap(false).as('hasStories')
      }
    })

    // Use conditional aliases
    cy.get('@hasStories').then((hasStories) => {
      if (hasStories) {
        cy.get('@firstStory').click()
        cy.url().should('include', '/stories/')
      } else {
        cy.get('[data-cy="empty-state"]').should('be.visible')
      }
    })
  })

  it('builds test data dynamically', () => {
    // * Generate test data based on form fields
    cy.get('[data-cy="story-form"]').within(() => {
      const formData = {}

      cy.get('input, select, textarea').each(($el) => {
        const fieldName = $el.attr('data-cy')
        const fieldType = $el.prop('type') || $el.prop('tagName').toLowerCase()

        let testValue
        switch (fieldType) {
          case 'text':
            testValue = `Test ${fieldName}`
            break
          case 'email':
            testValue = 'test@example.com'
            break
          case 'number':
            testValue = Math.floor(Math.random() * 100)
            break
          case 'select':
            cy.wrap($el).find('option').then(($options) => {
              const randomIndex = Math.floor(Math.random() * $options.length)
              testValue = $options.eq(randomIndex).val()
            })
            break
          default:
            testValue = `Test value for ${fieldName}`
        }

        formData[fieldName] = testValue
        cy.wrap($el).clear().type(testValue.toString())
      })

      cy.wrap(formData).as('formData')
    })

    // Use generated data for validation
    cy.get('@formData').then((data) => {
      cy.get('[data-cy="save-button"]').click()
      
      Object.entries(data).forEach(([field, value]) => {
        cy.get(`[data-cy="${field}-display"]`).should('contain', value)
      })
    })
  })
})
```

### Working with Promises and Async Operations

```javascript
describe('Promises and Async Operations', () => {
  it('handles Promise-based operations', () => {
    // * Convert Cypress commands to Promises when needed
    cy.get('[data-cy="story-count"]')
      .invoke('text')
      .then((countText) => {
        const count = parseInt(countText)
        
        // Create a Promise for complex async logic
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(count * 2)
          }, 100)
        })
      })
      .then((doubledCount) => {
        cy.log(`Doubled count: ${doubledCount}`)
        expect(doubledCount).to.be.greaterThan(0)
      })
  })

  it('handles multiple async operations', () => {
    // * Parallel async operations
    const getStoryCount = () => {
      return cy.get('[data-cy="story-item"]').its('length')
    }

    const getCharacterCount = () => {
      return cy.get('[data-cy="character-item"]').its('length')
    }

    // Wait for both operations
    cy.then(() => {
      return Promise.all([
        getStoryCount(),
        getCharacterCount()
      ])
    }).then(([storyCount, characterCount]) => {
      cy.log(`Stories: ${storyCount}, Characters: ${characterCount}`)
      
      const totalItems = storyCount + characterCount
      cy.wrap(totalItems).as('totalItems')
    })

    cy.get('@totalItems').should('be.greaterThan', 0)
  })

  it('handles window properties and localStorage', () => {
    // * Work with browser APIs
    cy.window().then((win) => {
      // Store window properties
      cy.wrap(win.innerWidth).as('windowWidth')
      cy.wrap(win.innerHeight).as('windowHeight')
      
      // Get localStorage data
      const userData = JSON.parse(win.localStorage.getItem('user') || '{}')
      cy.wrap(userData).as('userData')
    })

    cy.get('@windowWidth').should('be.greaterThan', 0)
    cy.get('@userData').should('have.property', 'id')

    // ? Use stored data in test
    cy.get('@userData').then((user) => {
      if (user.preferences) {
        cy.get(`[data-cy="theme-${user.preferences.theme}"]`)
          .should('be.selected')
      }
    })
  })
})
```

## Common Patterns and Best Practices

### Reusable Variable Patterns

```javascript
// * Custom command that returns aliased data
Cypress.Commands.add('createTestStory', (storyData = {}) => {
  const defaultData = {
    title: 'Test Story',
    content: 'Test content',
    genre: 'fantasy'
  }
  
  const story = { ...defaultData, ...storyData }
  
  cy.get('[data-cy="create-story-button"]').click()
  
  Object.entries(story).forEach(([field, value]) => {
    cy.get(`[data-cy="${field}-input"]`).type(value)
  })
  
  cy.get('[data-cy="save-button"]').click()
  
  // Return story data as alias
  return cy.wrap(story).as('createdStory')
})

// Usage in tests
describe('Story Creation with Reusable Patterns', () => {
  it('creates story with default data', () => {
    cy.createTestStory()
    
    cy.get('@createdStory').then((story) => {
      cy.get('[data-cy="story-title"]').should('contain', story.title)
    })
  })

  it('creates story with custom data', () => {
    const customStory = {
      title: 'Epic Adventure',
      genre: 'adventure'
    }
    
    cy.createTestStory(customStory)
    
    cy.get('@createdStory').then((story) => {
      expect(story.title).to.equal('Epic Adventure')
      expect(story.genre).to.equal('adventure')
    })
  })
})
```

### Error Handling with Variables

```javascript
describe('Error Handling with Variables', () => {
  it('handles missing elements gracefully', () => {
    // * Safe element checking
    cy.get('body').then(($body) => {
      const hasModal = $body.find('[data-cy="modal"]').length > 0
      cy.wrap(hasModal).as('modalExists')
    })

    cy.get('@modalExists').then((exists) => {
      if (exists) {
        cy.get('[data-cy="modal"]').within(() => {
          cy.get('[data-cy="close-button"]').click()
        })
      } else {
        cy.log('Modal not found, continuing test')
      }
    })
  })

  it('handles API errors with variables', () => {
    let requestFailed = false
    
    // * Intercept and handle errors
    cy.intercept('GET', '/api/stories', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('getStoriesError')

    cy.visit('/stories')
    
    cy.wait('@getStoriesError').then((interception) => {
      requestFailed = interception.response.statusCode >= 400
      cy.wrap(requestFailed).as('hasError')
    })

    cy.get('@hasError').then((hasError) => {
      if (hasError) {
        cy.get('[data-cy="error-message"]').should('be.visible')
        cy.get('[data-cy="retry-button"]').should('be.visible')
      } else {
        cy.get('[data-cy="story-list"]').should('be.visible')
      }
    })
  })
})
```

### Performance Monitoring with Variables

```javascript
describe('Performance Monitoring', () => {
  it('measures and stores performance metrics', () => {
    // * Measure page load time
    cy.visit('/stories', {
      onBeforeLoad: (win) => {
        win.performance.mark('pageStart')
      },
      onLoad: (win) => {
        win.performance.mark('pageEnd')
        win.performance.measure('pageLoad', 'pageStart', 'pageEnd')
      }
    })

    cy.window().then((win) => {
      const measure = win.performance.getEntriesByName('pageLoad')[0]
      cy.wrap(measure.duration).as('pageLoadTime')
    })

    cy.get('@pageLoadTime').should('be.lessThan', 3000) // Page should load in under 3 seconds

    // * Measure API response times
    cy.intercept('GET', '/api/stories').as('getStories')
    cy.get('[data-cy="refresh-button"]').click()
    
    cy.wait('@getStories').then((interception) => {
      const responseTime = interception.response.duration
      cy.wrap(responseTime).as('apiResponseTime')
    })

    cy.get('@apiResponseTime').should('be.lessThan', 1000) // API should respond in under 1 second
  })
})
```

This comprehensive guide covers all aspects of working with variables and aliases in Cypress, providing practical examples for managing asynchronous operations, storing and reusing data, and handling complex test scenarios.