describe('Basic pages', function() {
    it('check the listings page loads', function(browser) {
      browser
        .navigateTo('http://localhost:3000/listings')
        .waitForElementVisible('body')
    }); 
  });