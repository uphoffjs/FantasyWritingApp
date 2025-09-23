
DevTools listening on ws://127.0.0.1:57199/devtools/browser/3958c3d7-13e3-46d5-a198-00a3057ef17a
Missing baseUrl in compilerOptions. tsconfig-paths will be skipped

🚀 Fantasy Element Builder is running on port 3003
📱 Open http://localhost:3003 in your browser


Opening `/dev/tty` failed (6): Device not configured
================================================================================

  (Run Starting)

  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Cypress:        14.5.4                                                                         │
  │ Browser:        Electron 130 (headless)                                                        │
  │ Node Version:   v22.19.0 (/usr/local/bin/node)                                                 │
  │ Specs:          26 found (ui/Button.cy.tsx, ui/ImageUpload.cy.tsx, ui/LoadingSpinner.cy.tsx, u │
  │                 i/MarkdownExportModal.cy.tsx, ui/ProgressBar.cy.tsx, ui/RichTextEditor.cy.tsx, │
  │                  ui/TagInput.cy.tsx, ui/TagMultiSelect.cy.tsx, ui/TextInput.a11y.cy.tsx, ui/Te │
  │                 xtInput.boundary.cy.tsx...)                                                    │
  │ Searched:       cypress/component/ui/*.cy.tsx, cypress/component/elements/*.cy.tsx             │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘


────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                                                    
  Running:  ui/Button.cy.tsx                                                               (1 of 26)
11 assets
461 modules
webpack 5.101.3 compiled [1m[32msuccessfully[39m[22m in 2669 ms
14 assets
565 modules
webpack 5.101.3 compiled [1m[32msuccessfully[39m[22m in 672 ms
["start",{"total":4}]
Factory reset called
[2025-09-23T18:18:31.286Z] Test started: should render a button with React Native components
Browser: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/14.5.4 Chrome/130.0.6723.137 Electron/33.2.1 Safari/537.36
Viewport: 1280x720
URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/Button.cy.tsx
State cleaned - localStorage, sessionStorage, cookies, and IndexedDB cleared
Screenshot taken: failed-should-render-a-button-with-React-Native-components-1758651511658
Failed at URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/Button.cy.tsx
Page title: FantasyWritingApp Component Tests
Visible page text (first 1000 chars): 
    
  

[TEST FAILURE] Timed out retrying after 10000ms: Expected to find element: `[data-cy], [data-testid]`, but never found it.
[STACK TRACE] AssertionError: Timed out retrying after 10000ms: Expected to find element: `[data-cy], [data-testid]`, but never found it.
    at Context.<anonymous> (webpack://FantasyWritingApp/./cypress/support/commands/debug.ts:162:5)
    at wrapped (http://localhost:3003/__cypress/runner/cypress_runner.js:141663:43)
Factory reset called
[2025-09-23T18:18:43.304Z] Test started: should render a button with React Native components
Browser: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/14.5.4 Chrome/130.0.6723.137 Electron/33.2.1 Safari/537.36
Viewport: 375x812
URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/Button.cy.tsx
State cleaned - localStorage, sessionStorage, cookies, and IndexedDB cleared
Screenshot taken: failed-should-render-a-button-with-React-Native-components-1758651523632
Failed at URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/Button.cy.tsx
Page title: FantasyWritingApp Component Tests
Visible page text (first 1000 chars): 
    
  

[TEST FAILURE] Timed out retrying after 10000ms: Expected to find element: `[data-cy], [data-testid]`, but never found it.
[STACK TRACE] AssertionError: Timed out retrying after 10000ms: Expected to find element: `[data-cy], [data-testid]`, but never found it.
    at Context.<anonymous> (webpack://FantasyWritingApp/./cypress/support/commands/debug.ts:162:5)
    at wrapped (http://localhost:3003/__cypress/runner/cypress_runner.js:141663:43)
Factory reset called
[2025-09-23T18:18:55.054Z] Test started: should render a button with React Native components
Browser: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/14.5.4 Chrome/130.0.6723.137 Electron/33.2.1 Safari/537.36
Viewport: 375x812
URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/Button.cy.tsx
State cleaned - localStorage, sessionStorage, cookies, and IndexedDB cleared
["fail",{"title":"should render a button with React Native components","fullTitle":"Button Component should render a button with React Native components","file":null,"duration":10562,"currentRetry":2,"err":"The following error originated from your application code, not from Cypress.\n\n  > useTheme must be used within a ThemeProvider\n\nWhen Cypress detects uncaught errors originating from your application it will automatically fail the current test.\n\nThis behavior is configurable, and you can choose to turn this off by listening to the `uncaught:exception` event.\n\nhttps://on.cypress.io/uncaught-exception-from-application","stack":"Error: The following error originated from your application code, not from Cypress.\n\n  > useTheme must be used within a ThemeProvider\n\nWhen Cypress detects uncaught errors originating from your application it will automatically fail the current test.\n\nThis behavior is configurable, and you can choose to turn this off by listening to the `uncaught:exception` event.\n\nhttps://on.cypress.io/uncaught-exception-from-application\n    at useTheme (webpack://FantasyWritingApp/./src/providers/ThemeProvider.tsx:493:10)\n    at Button (webpack://FantasyWritingApp/./src/components/Button.tsx:45:29)\n    at react-stack-bottom-frame (http://localhost:3003/__cypress/src/vendors-node_modules_cypress_react_dist_cypress-react_esm-bundler_js-node_modules_supabase_su-585f84.js:47580:20)\n    at renderWithHooks (http://localhost:3003/__cypress/src/vendors-node_modules_cypress_react_dist_cypress-react_esm-bundler_js-node_modules_supabase_su-585f84.js:29246:22)\n    at updateFunctionComponent (http://localhost:3003/__cypress/src/vendors-node_modules_cypress_react_dist_cypress-react_esm-bundler_js-node_modules_supabase_su-585f84.js:32614:19)\n    at beginWork (http://localhost:3003/__cypress/src/vendors-node_modules_cypress_react_dist_cypress-react_esm-bundler_js-node_modules_supabase_su-585f84.js:34239:18)\n    at runWithFiberInDEV (http://localhost:3003/__cypress/src/vendors-node_modules_cypress_react_dist_cypress-react_esm-bundler_js-node_modules_supabase_su-585f84.js:25237:30)\n    at performUnitOfWork (http://localhost:3003/__cypress/src/vendors-node_modules_cypress_react_dist_cypress-react_esm-bundler_js-node_modules_supabase_su-585f84.js:38857:22)\n    at workLoopSync (http://localhost:3003/__cypress/src/vendors-node_modules_cypress_react_dist_cypress-react_esm-bundler_js-node_modules_supabase_su-585f84.js:38673:41)\n    at renderRootSync (http://localhost:3003/__cypress/src/vendors-node_modules_cypress_react_dist_cypress-react_esm-bundler_js-node_modules_supabase_su-585f84.js:38653:11)"}]
Screenshot taken: failed-should-render-a-button-with-React-Native-components-1758651535403
Failed at URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/Button.cy.tsx
Page title: FantasyWritingApp Component Tests
Visible page text (first 1000 chars): 
    
  

["fail",{"title":"\"after each\" hook for \"should render a button with React Native components\"","fullTitle":"Button Component \"after each\" hook for \"should render a button with React Native components\"","file":null,"duration":10562,"currentRetry":2,"err":"Timed out retrying after 10000ms: Expected to find element: `[data-cy], [data-testid]`, but never found it.\n\nBecause this error occurred during a `after each` hook we are skipping the remaining tests in the current suite: `Button Component`","stack":"AssertionError: Timed out retrying after 10000ms: Expected to find element: `[data-cy], [data-testid]`, but never found it.\n\nBecause this error occurred during a `after each` hook we are skipping the remaining tests in the current suite: `Button Component`\n    at Context.<anonymous> (webpack://FantasyWritingApp/./cypress/support/commands/debug.ts:162:5)\n    at wrapped (http://localhost:3003/__cypress/runner/cypress_runner.js:141663:43)"}]
[TEST FAILURE] Timed out retrying after 10000ms: Expected to find element: `[data-cy], [data-testid]`, but never found it.
[STACK TRACE] AssertionError: Timed out retrying after 10000ms: Expected to find element: `[data-cy], [data-testid]`, but never found it.
    at Context.<anonymous> (webpack://FantasyWritingApp/./cypress/support/commands/debug.ts:162:5)
    at wrapped (http://localhost:3003/__cypress/runner/cypress_runner.js:141663:43)
["end",{"suites":1,"tests":1,"passes":0,"pending":0,"failures":2,"start":"2025-09-23T18:18:31.262Z","end":"2025-09-23T18:19:06.737Z","duration":35475}]

  (Results)

  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Tests:        4                                                                                │
  │ Passing:      0                                                                                │
  │ Failing:      1                                                                                │
  │ Pending:      0                                                                                │
  │ Skipped:      3                                                                                │
  │ Screenshots:  9                                                                                │
  │ Video:        false                                                                            │
  │ Duration:     35 seconds                                                                       │
  │ Spec Ran:     ui/Button.cy.tsx                                                                 │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘


  (Screenshots)

  -  /Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/screenshots/ui/Button.cy.ts    (2560x1440)
     x/Button Component -- should render a button with React Native components (faile               
     d).png                                                                                         
  -  /Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/screenshots/ui/Button.cy.ts    (2560x1440)
     x/failed-should-render-a-button-with-React-Native-components-1758651511658.png                 
  -  /Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/screenshots/ui/Button.cy.ts    (2560x1440)
     x/Button Component -- should render a button with React Native components -- aft               
     er each hook (failed).png                                                                      
  -  /Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/screenshots/ui/Button.cy.ts    (2560x1440)
     x/Button Component -- should render a button with React Native components (faile               
     d) (attempt 2).png                                                                             
  -  /Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/screenshots/ui/Button.cy.ts     (750x1440)
     x/failed-should-render-a-button-with-React-Native-components-1758651523632 (atte               
     mpt 2).png                                                                                     
  -  /Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/screenshots/ui/Button.cy.ts    (2560x1440)
     x/Button Component -- should render a button with React Native components -- aft               
     er each hook (failed) (attempt 2).png                                                          
  -  /Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/screenshots/ui/Button.cy.ts    (2560x1440)
     x/Button Component -- should render a button with React Native components (faile               
     d) (attempt 3).png                                                                             
  -  /Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/screenshots/ui/Button.cy.ts     (750x1440)
     x/failed-should-render-a-button-with-React-Native-components-1758651535403 (atte               
     mpt 3).png                                                                                     
  -  /Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/screenshots/ui/Button.cy.ts    (2560x1440)
     x/Button Component -- should render a button with React Native components -- aft               
     er each hook (failed) (attempt 3).png                                                          


────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                                                    
  Running:  ui/ImageUpload.cy.tsx                                                          (2 of 26)
13 assets
462 modules

[1m[31mERROR[39m[22m in [1m./cypress/component/ui/ImageUpload.cy.tsx[39m[22m [1m[32m17:0-66[39m[22m
[1mModule [1m[31mnot found[39m[22m[1m: [1m[31mError[39m[22m[1m: Can't resolve '../../../src/components/ImageUpload' in '/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui'[39m[22m

webpack 5.101.3 compiled with [1m[31m1 error[39m[22m in 286 ms
["start",{"total":1}]
Factory reset called
Factory reset called
Factory reset called
["fail",{"title":"An uncaught error was detected outside of a test","fullTitle":"An uncaught error was detected outside of a test","duration":231,"currentRetry":2,"err":"The following error originated from your test code, not from Cypress.\n\n  > Cannot find module '../../../src/components/ImageUpload'\n\nWhen Cypress detects uncaught errors originating from your test code it will automatically fail the current test.\n\nCypress could not associate this error to any specific test.\n\nWe dynamically generated a new test to display this failure.","stack":"Error: The following error originated from your test code, not from Cypress.\n\n  > Cannot find module '../../../src/components/ImageUpload'\n\nWhen Cypress detects uncaught errors originating from your test code it will automatically fail the current test.\n\nCypress could not associate this error to any specific test.\n\nWe dynamically generated a new test to display this failure.\n    at webpackMissingModule (http://localhost:3003/__cypress/src/spec-0.js:13:50)\n    at ./cypress/component/ui/ImageUpload.cy.tsx (http://localhost:3003/__cypress/src/spec-0.js:13:160)\n    at Function.__webpack_require__ (http://localhost:3003/__cypress/src/runtime.js:23:42)"}]
["end",{"suites":0,"tests":1,"passes":0,"pending":0,"failures":1,"start":"2025-09-23T18:19:08.952Z","end":"2025-09-23T18:19:09.695Z","duration":743}]

  (Results)

  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Tests:        1                                                                                │
  │ Passing:      0                                                                                │
  │ Failing:      1                                                                                │
  │ Pending:      0                                                                                │
  │ Skipped:      0                                                                                │
  │ Screenshots:  3                                                                                │
  │ Video:        false                                                                            │
  │ Duration:     0 seconds                                                                        │
  │ Spec Ran:     ui/ImageUpload.cy.tsx                                                            │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘


  (Screenshots)

  -  /Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/screenshots/ui/ImageUpload.    (2560x1440)
     cy.tsx/An uncaught error was detected outside of a test (failed).png                           
  -  /Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/screenshots/ui/ImageUpload.    (2560x1440)
     cy.tsx/An uncaught error was detected outside of a test (failed) (attempt 2).png               
  -  /Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/screenshots/ui/ImageUpload.    (2560x1440)
     cy.tsx/An uncaught error was detected outside of a test (failed) (attempt 3).png               


────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                                                    
  Running:  ui/LoadingSpinner.cy.tsx                                                       (3 of 26)
14 assets
558 modules
webpack 5.101.3 compiled [1m[32msuccessfully[39m[22m in 197 ms
["start",{"total":13}]
Factory reset called
[2025-09-23T18:19:11.960Z] Test started: should render with default loading message
Browser: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/14.5.4 Chrome/130.0.6723.137 Electron/33.2.1 Safari/537.36
Viewport: 1280x720
URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/LoadingSpinner.cy.tsx
State cleaned - localStorage, sessionStorage, cookies, and IndexedDB cleared
[TEST FAILURE] Timed out retrying after 10000ms: expected '<div.css-view-g5y9jx.r-alignItems-1awozwy.r-backgroundColor-1uzerr7.r-borderRadius-1q9bdsx.r-justifyContent-1777fci.r-minHeight-nfz12p.r-minWidth-4ukpa0.r-padding-nsbfu8>' to contain HTML 'svg', but the HTML was '<div class="css-view-g5y9jx r-alignItems-1awozwy r-height-h3s6tt r-justifyContent-1777fci r-width-rwqe4o"><div class="css-view-g5y9jx r-alignItems-1awozwy r-height-h3s6tt r-justifyContent-1777fci r-width-rwqe4o" data-testid="loading-screen-ring" style="transform: rotate(360deg);"><div class="css-view-g5y9jx r-borderColor-ssfsqc r-borderRadius-1fuqb1j r-borderRightColor-114ovsg r-borderStyle-1phboty r-borderTopColor-1c1gj4h r-borderWidth-1d6rzhh r-height-h3s6tt r-width-rwqe4o"><div class="css-view-g5y9jx r-backgroundColor-brjoub r-borderRadius-cdmcib r-height-1xbve24 r-left-1wyvozj r-marginLeft-1hjkk89 r-marginTop-1ut7uwi r-position-u8s1d r-top-1v2oles r-width-8hc5te"></div></div></div></div><div dir="auto" class="css-text-146c3p1 r-color-74cqfr r-fontFamily-1qd0xha r-fontSize-1i10wst r-marginTop-knv0ih r-textAlign-q4m81j" data-testid="loading-screen-message" style="opacity: 1;">Loading...</div>'
[STACK TRACE] AssertionError: Timed out retrying after 10000ms: expected '<div.css-view-g5y9jx.r-alignItems-1awozwy.r-backgroundColor-1uzerr7.r-borderRadius-1q9bdsx.r-justifyContent-1777fci.r-minHeight-nfz12p.r-minWidth-4ukpa0.r-padding-nsbfu8>' to contain HTML 'svg', but the HTML was '<div class="css-view-g5y9jx r-alignItems-1awozwy r-height-h3s6tt r-justifyContent-1777fci r-width-rwqe4o"><div class="css-view-g5y9jx r-alignItems-1awozwy r-height-h3s6tt r-justifyContent-1777fci r-width-rwqe4o" data-testid="loading-screen-ring" style="transform: rotate(360deg);"><div class="css-view-g5y9jx r-borderColor-ssfsqc r-borderRadius-1fuqb1j r-borderRightColor-114ovsg r-borderStyle-1phboty r-borderTopColor-1c1gj4h r-borderWidth-1d6rzhh r-height-h3s6tt r-width-rwqe4o"><div class="css-view-g5y9jx r-backgroundColor-brjoub r-borderRadius-cdmcib r-height-1xbve24 r-left-1wyvozj r-marginLeft-1hjkk89 r-marginTop-1ut7uwi r-position-u8s1d r-top-1v2oles r-width-8hc5te"></div></div></div></div><div dir="auto" class="css-text-146c3p1 r-color-74cqfr r-fontFamily-1qd0xha r-fontSize-1i10wst r-marginTop-knv0ih r-textAlign-q4m81j" data-testid="loading-screen-message" style="opacity: 1;">Loading...</div>'
    at Context.<anonymous> (webpack://FantasyWritingApp/./cypress/component/ui/LoadingSpinner.cy.tsx:43:41)
Screenshot taken: failed-should-render-with-default-loading-message-1758651562298
Failed at URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/LoadingSpinner.cy.tsx
Page title: FantasyWritingApp Component Tests
Visible page text (first 1000 chars): 
    Loading...
  

Found 3 testable elements: [{"data-cy":null,"data-testid":"loading-screen","tagName":"DIV","text":"Loading..."},{"data-cy":null,"data-testid":"loading-screen-ring","tagName":"DIV","text":""},{"data-cy":null,"data-testid":"loading-screen-message","tagName":"DIV","text":"Loading..."}]
Loading indicators found: [data-testid*="loading"]
[CONSOLE WARN] Animated: `useNativeDriver` is not supported because the native animated module is missing. Falling back to JS-based animation. To resolve this, add `RCTAnimation` module to this app, or remove `useNativeDriver`. Make sure to run `bundle exec pod install` first. Read more about autolinking: https://github.com/react-native-community/cli/blob/master/docs/autolinking.md
Factory reset called
[2025-09-23T18:19:23.300Z] Test started: should render with default loading message
Browser: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/14.5.4 Chrome/130.0.6723.137 Electron/33.2.1 Safari/537.36
Viewport: 375x812
URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/LoadingSpinner.cy.tsx
State cleaned - localStorage, sessionStorage, cookies, and IndexedDB cleared
[TEST FAILURE] Timed out retrying after 10000ms: expected '<div.css-view-g5y9jx.r-alignItems-1awozwy.r-backgroundColor-1uzerr7.r-borderRadius-1q9bdsx.r-justifyContent-1777fci.r-minHeight-nfz12p.r-minWidth-4ukpa0.r-padding-nsbfu8>' to contain HTML 'svg', but the HTML was '<div class="css-view-g5y9jx r-alignItems-1awozwy r-height-h3s6tt r-justifyContent-1777fci r-width-rwqe4o"><div class="css-view-g5y9jx r-alignItems-1awozwy r-height-h3s6tt r-justifyContent-1777fci r-width-rwqe4o" data-testid="loading-screen-ring" style="transform: rotate(360deg);"><div class="css-view-g5y9jx r-borderColor-ssfsqc r-borderRadius-1fuqb1j r-borderRightColor-114ovsg r-borderStyle-1phboty r-borderTopColor-1c1gj4h r-borderWidth-1d6rzhh r-height-h3s6tt r-width-rwqe4o"><div class="css-view-g5y9jx r-backgroundColor-brjoub r-borderRadius-cdmcib r-height-1xbve24 r-left-1wyvozj r-marginLeft-1hjkk89 r-marginTop-1ut7uwi r-position-u8s1d r-top-1v2oles r-width-8hc5te"></div></div></div></div><div dir="auto" class="css-text-146c3p1 r-color-74cqfr r-fontFamily-1qd0xha r-fontSize-1i10wst r-marginTop-knv0ih r-textAlign-q4m81j" data-testid="loading-screen-message" style="opacity: 1;">Loading...</div>'
[STACK TRACE] AssertionError: Timed out retrying after 10000ms: expected '<div.css-view-g5y9jx.r-alignItems-1awozwy.r-backgroundColor-1uzerr7.r-borderRadius-1q9bdsx.r-justifyContent-1777fci.r-minHeight-nfz12p.r-minWidth-4ukpa0.r-padding-nsbfu8>' to contain HTML 'svg', but the HTML was '<div class="css-view-g5y9jx r-alignItems-1awozwy r-height-h3s6tt r-justifyContent-1777fci r-width-rwqe4o"><div class="css-view-g5y9jx r-alignItems-1awozwy r-height-h3s6tt r-justifyContent-1777fci r-width-rwqe4o" data-testid="loading-screen-ring" style="transform: rotate(360deg);"><div class="css-view-g5y9jx r-borderColor-ssfsqc r-borderRadius-1fuqb1j r-borderRightColor-114ovsg r-borderStyle-1phboty r-borderTopColor-1c1gj4h r-borderWidth-1d6rzhh r-height-h3s6tt r-width-rwqe4o"><div class="css-view-g5y9jx r-backgroundColor-brjoub r-borderRadius-cdmcib r-height-1xbve24 r-left-1wyvozj r-marginLeft-1hjkk89 r-marginTop-1ut7uwi r-position-u8s1d r-top-1v2oles r-width-8hc5te"></div></div></div></div><div dir="auto" class="css-text-146c3p1 r-color-74cqfr r-fontFamily-1qd0xha r-fontSize-1i10wst r-marginTop-knv0ih r-textAlign-q4m81j" data-testid="loading-screen-message" style="opacity: 1;">Loading...</div>'
    at Context.<anonymous> (webpack://FantasyWritingApp/./cypress/component/ui/LoadingSpinner.cy.tsx:43:41)
Screenshot taken: failed-should-render-with-default-loading-message-1758651573648
Failed at URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/LoadingSpinner.cy.tsx
Page title: FantasyWritingApp Component Tests
Visible page text (first 1000 chars): 
    Loading...
  

Found 3 testable elements: [{"data-cy":null,"data-testid":"loading-screen","tagName":"DIV","text":"Loading..."},{"data-cy":null,"data-testid":"loading-screen-ring","tagName":"DIV","text":""},{"data-cy":null,"data-testid":"loading-screen-message","tagName":"DIV","text":"Loading..."}]
Loading indicators found: [data-testid*="loading"]
[CONSOLE WARN] Animated: `useNativeDriver` is not supported because the native animated module is missing. Falling back to JS-based animation. To resolve this, add `RCTAnimation` module to this app, or remove `useNativeDriver`. Make sure to run `bundle exec pod install` first. Read more about autolinking: https://github.com/react-native-community/cli/blob/master/docs/autolinking.md
Factory reset called
[2025-09-23T18:19:34.437Z] Test started: should render with default loading message
Browser: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/14.5.4 Chrome/130.0.6723.137 Electron/33.2.1 Safari/537.36
Viewport: 375x812
URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/LoadingSpinner.cy.tsx
State cleaned - localStorage, sessionStorage, cookies, and IndexedDB cleared
["fail",{"title":"should render with default loading message","fullTitle":"LoadingScreen Component should render with default loading message","file":null,"duration":10397,"currentRetry":2,"err":"Timed out retrying after 10000ms: expected '<div.css-view-g5y9jx.r-alignItems-1awozwy.r-backgroundColor-1uzerr7.r-borderRadius-1q9bdsx.r-justifyContent-1777fci.r-minHeight-nfz12p.r-minWidth-4ukpa0.r-padding-nsbfu8>' to contain HTML 'svg', but the HTML was '<div class=\"css-view-g5y9jx r-alignItems-1awozwy r-height-h3s6tt r-justifyContent-1777fci r-width-rwqe4o\"><div class=\"css-view-g5y9jx r-alignItems-1awozwy r-height-h3s6tt r-justifyContent-1777fci r-width-rwqe4o\" data-testid=\"loading-screen-ring\" style=\"transform: rotate(360deg);\"><div class=\"css-view-g5y9jx r-borderColor-ssfsqc r-borderRadius-1fuqb1j r-borderRightColor-114ovsg r-borderStyle-1phboty r-borderTopColor-1c1gj4h r-borderWidth-1d6rzhh r-height-h3s6tt r-width-rwqe4o\"><div class=\"css-view-g5y9jx r-backgroundColor-brjoub r-borderRadius-cdmcib r-height-1xbve24 r-left-1wyvozj r-marginLeft-1hjkk89 r-marginTop-1ut7uwi r-position-u8s1d r-top-1v2oles r-width-8hc5te\"></div></div></div></div><div dir=\"auto\" class=\"css-text-146c3p1 r-color-74cqfr r-fontFamily-1qd0xha r-fontSize-1i10wst r-marginTop-knv0ih r-textAlign-q4m81j\" data-testid=\"loading-screen-message\" style=\"opacity: 1;\">Loading...</div>'","stack":"AssertionError: Timed out retrying after 10000ms: expected '<div.css-view-g5y9jx.r-alignItems-1awozwy.r-backgroundColor-1uzerr7.r-borderRadius-1q9bdsx.r-justifyContent-1777fci.r-minHeight-nfz12p.r-minWidth-4ukpa0.r-padding-nsbfu8>' to contain HTML 'svg', but the HTML was '<div class=\"css-view-g5y9jx r-alignItems-1awozwy r-height-h3s6tt r-justifyContent-1777fci r-width-rwqe4o\"><div class=\"css-view-g5y9jx r-alignItems-1awozwy r-height-h3s6tt r-justifyContent-1777fci r-width-rwqe4o\" data-testid=\"loading-screen-ring\" style=\"transform: rotate(360deg);\"><div class=\"css-view-g5y9jx r-borderColor-ssfsqc r-borderRadius-1fuqb1j r-borderRightColor-114ovsg r-borderStyle-1phboty r-borderTopColor-1c1gj4h r-borderWidth-1d6rzhh r-height-h3s6tt r-width-rwqe4o\"><div class=\"css-view-g5y9jx r-backgroundColor-brjoub r-borderRadius-cdmcib r-height-1xbve24 r-left-1wyvozj r-marginLeft-1hjkk89 r-marginTop-1ut7uwi r-position-u8s1d r-top-1v2oles r-width-8hc5te\"></div></div></div></div><div dir=\"auto\" class=\"css-text-146c3p1 r-color-74cqfr r-fontFamily-1qd0xha r-fontSize-1i10wst r-marginTop-knv0ih r-textAlign-q4m81j\" data-testid=\"loading-screen-message\" style=\"opacity: 1;\">Loading...</div>'\n    at Context.<anonymous> (webpack://FantasyWritingApp/./cypress/component/ui/LoadingSpinner.cy.tsx:43:41)"}]
[TEST FAILURE] Timed out retrying after 10000ms: expected '<div.css-view-g5y9jx.r-alignItems-1awozwy.r-backgroundColor-1uzerr7.r-borderRadius-1q9bdsx.r-justifyContent-1777fci.r-minHeight-nfz12p.r-minWidth-4ukpa0.r-padding-nsbfu8>' to contain HTML 'svg', but the HTML was '<div class="css-view-g5y9jx r-alignItems-1awozwy r-height-h3s6tt r-justifyContent-1777fci r-width-rwqe4o"><div class="css-view-g5y9jx r-alignItems-1awozwy r-height-h3s6tt r-justifyContent-1777fci r-width-rwqe4o" data-testid="loading-screen-ring" style="transform: rotate(360deg);"><div class="css-view-g5y9jx r-borderColor-ssfsqc r-borderRadius-1fuqb1j r-borderRightColor-114ovsg r-borderStyle-1phboty r-borderTopColor-1c1gj4h r-borderWidth-1d6rzhh r-height-h3s6tt r-width-rwqe4o"><div class="css-view-g5y9jx r-backgroundColor-brjoub r-borderRadius-cdmcib r-height-1xbve24 r-left-1wyvozj r-marginLeft-1hjkk89 r-marginTop-1ut7uwi r-position-u8s1d r-top-1v2oles r-width-8hc5te"></div></div></div></div><div dir="auto" class="css-text-146c3p1 r-color-74cqfr r-fontFamily-1qd0xha r-fontSize-1i10wst r-marginTop-knv0ih r-textAlign-q4m81j" data-testid="loading-screen-message" style="opacity: 1;">Loading...</div>'
[STACK TRACE] AssertionError: Timed out retrying after 10000ms: expected '<div.css-view-g5y9jx.r-alignItems-1awozwy.r-backgroundColor-1uzerr7.r-borderRadius-1q9bdsx.r-justifyContent-1777fci.r-minHeight-nfz12p.r-minWidth-4ukpa0.r-padding-nsbfu8>' to contain HTML 'svg', but the HTML was '<div class="css-view-g5y9jx r-alignItems-1awozwy r-height-h3s6tt r-justifyContent-1777fci r-width-rwqe4o"><div class="css-view-g5y9jx r-alignItems-1awozwy r-height-h3s6tt r-justifyContent-1777fci r-width-rwqe4o" data-testid="loading-screen-ring" style="transform: rotate(360deg);"><div class="css-view-g5y9jx r-borderColor-ssfsqc r-borderRadius-1fuqb1j r-borderRightColor-114ovsg r-borderStyle-1phboty r-borderTopColor-1c1gj4h r-borderWidth-1d6rzhh r-height-h3s6tt r-width-rwqe4o"><div class="css-view-g5y9jx r-backgroundColor-brjoub r-borderRadius-cdmcib r-height-1xbve24 r-left-1wyvozj r-marginLeft-1hjkk89 r-marginTop-1ut7uwi r-position-u8s1d r-top-1v2oles r-width-8hc5te"></div></div></div></div><div dir="auto" class="css-text-146c3p1 r-color-74cqfr r-fontFamily-1qd0xha r-fontSize-1i10wst r-marginTop-knv0ih r-textAlign-q4m81j" data-testid="loading-screen-message" style="opacity: 1;">Loading...</div>'
    at Context.<anonymous> (webpack://FantasyWritingApp/./cypress/component/ui/LoadingSpinner.cy.tsx:43:41)
Screenshot taken: failed-should-render-with-default-loading-message-1758651584834
Failed at URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/LoadingSpinner.cy.tsx
Page title: FantasyWritingApp Component Tests
Visible page text (first 1000 chars): 
    Loading...
  

Found 3 testable elements: [{"data-cy":null,"data-testid":"loading-screen","tagName":"DIV","text":"Loading..."},{"data-cy":null,"data-testid":"loading-screen-ring","tagName":"DIV","text":""},{"data-cy":null,"data-testid":"loading-screen-message","tagName":"DIV","text":"Loading..."}]
Loading indicators found: [data-testid*="loading"]
[CONSOLE WARN] Animated: `useNativeDriver` is not supported because the native animated module is missing. Falling back to JS-based animation. To resolve this, add `RCTAnimation` module to this app, or remove `useNativeDriver`. Make sure to run `bundle exec pod install` first. Read more about autolinking: https://github.com/react-native-community/cli/blob/master/docs/autolinking.md
Factory reset called
[2025-09-23T18:19:45.574Z] Test started: should render with custom loading message
Browser: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/14.5.4 Chrome/130.0.6723.137 Electron/33.2.1 Safari/537.36
Viewport: 375x812
URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/LoadingSpinner.cy.tsx
State cleaned - localStorage, sessionStorage, cookies, and IndexedDB cleared
["pass",{"title":"should render with custom loading message","fullTitle":"LoadingScreen Component should render with custom loading message","file":null,"duration":62,"currentRetry":0}]
Factory reset called
[2025-09-23T18:19:45.640Z] Test started: should display spinner animation
Browser: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/14.5.4 Chrome/130.0.6723.137 Electron/33.2.1 Safari/537.36
Viewport: 375x812
URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/LoadingSpinner.cy.tsx
State cleaned - localStorage, sessionStorage, cookies, and IndexedDB cleared
["pass",{"title":"should display spinner animation","fullTitle":"LoadingScreen Component should display spinner animation","file":null,"duration":61,"currentRetry":0}]
Factory reset called
[2025-09-23T18:19:45.728Z] Test started: should have proper styling and layout
Browser: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/14.5.4 Chrome/130.0.6723.137 Electron/33.2.1 Safari/537.36
Viewport: 375x812
URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/LoadingSpinner.cy.tsx
State cleaned - localStorage, sessionStorage, cookies, and IndexedDB cleared
[TEST FAILURE] Timed out retrying after 10000ms: expected '<div.css-view-g5y9jx.r-alignItems-1awozwy.r-backgroundColor-1uzerr7.r-borderRadius-1q9bdsx.r-justifyContent-1777fci.r-minHeight-nfz12p.r-minWidth-4ukpa0.r-padding-nsbfu8>' to have CSS property 'background-color' with the value 'rgb(17, 24, 39)', but the value was 'rgb(243, 233, 210)'
[STACK TRACE] AssertionError: Timed out retrying after 10000ms: expected '<div.css-view-g5y9jx.r-alignItems-1awozwy.r-backgroundColor-1uzerr7.r-borderRadius-1q9bdsx.r-justifyContent-1777fci.r-minHeight-nfz12p.r-minWidth-4ukpa0.r-padding-nsbfu8>' to have CSS property 'background-color' with the value 'rgb(17, 24, 39)', but the value was 'rgb(243, 233, 210)'
    at Context.<anonymous> (webpack://FantasyWritingApp/./cypress/component/ui/LoadingSpinner.cy.tsx:81:7)
Screenshot taken: failed-should-have-proper-styling-and-layout-1758651596007
Failed at URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/LoadingSpinner.cy.tsx
Page title: FantasyWritingApp Component Tests
Visible page text (first 1000 chars): 
    Loading...
  

Found 3 testable elements: [{"data-cy":null,"data-testid":"loading-screen","tagName":"DIV","text":"Loading..."},{"data-cy":null,"data-testid":"loading-screen-ring","tagName":"DIV","text":""},{"data-cy":null,"data-testid":"loading-screen-message","tagName":"DIV","text":"Loading..."}]
Loading indicators found: [data-testid*="loading"]
[CONSOLE WARN] Animated: `useNativeDriver` is not supported because the native animated module is missing. Falling back to JS-based animation. To resolve this, add `RCTAnimation` module to this app, or remove `useNativeDriver`. Make sure to run `bundle exec pod install` first. Read more about autolinking: https://github.com/react-native-community/cli/blob/master/docs/autolinking.md
Factory reset called
[2025-09-23T18:19:56.729Z] Test started: should have proper styling and layout
Browser: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/14.5.4 Chrome/130.0.6723.137 Electron/33.2.1 Safari/537.36
Viewport: 375x812
URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/LoadingSpinner.cy.tsx
State cleaned - localStorage, sessionStorage, cookies, and IndexedDB cleared
[TEST FAILURE] Timed out retrying after 10000ms: expected '<div.css-view-g5y9jx.r-alignItems-1awozwy.r-backgroundColor-1uzerr7.r-borderRadius-1q9bdsx.r-justifyContent-1777fci.r-minHeight-nfz12p.r-minWidth-4ukpa0.r-padding-nsbfu8>' to have CSS property 'background-color' with the value 'rgb(17, 24, 39)', but the value was 'rgb(243, 233, 210)'
[STACK TRACE] AssertionError: Timed out retrying after 10000ms: expected '<div.css-view-g5y9jx.r-alignItems-1awozwy.r-backgroundColor-1uzerr7.r-borderRadius-1q9bdsx.r-justifyContent-1777fci.r-minHeight-nfz12p.r-minWidth-4ukpa0.r-padding-nsbfu8>' to have CSS property 'background-color' with the value 'rgb(17, 24, 39)', but the value was 'rgb(243, 233, 210)'
    at Context.<anonymous> (webpack://FantasyWritingApp/./cypress/component/ui/LoadingSpinner.cy.tsx:81:7)
Screenshot taken: failed-should-have-proper-styling-and-layout-1758651607107
Failed at URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/LoadingSpinner.cy.tsx
Page title: FantasyWritingApp Component Tests
Visible page text (first 1000 chars): 
    Loading...
  

Found 3 testable elements: [{"data-cy":null,"data-testid":"loading-screen","tagName":"DIV","text":"Loading..."},{"data-cy":null,"data-testid":"loading-screen-ring","tagName":"DIV","text":""},{"data-cy":null,"data-testid":"loading-screen-message","tagName":"DIV","text":"Loading..."}]
Loading indicators found: [data-testid*="loading"]
[CONSOLE WARN] Animated: `useNativeDriver` is not supported because the native animated module is missing. Falling back to JS-based animation. To resolve this, add `RCTAnimation` module to this app, or remove `useNativeDriver`. Make sure to run `bundle exec pod install` first. Read more about autolinking: https://github.com/react-native-community/cli/blob/master/docs/autolinking.md
Factory reset called
[2025-09-23T18:20:07.924Z] Test started: should have proper styling and layout
Browser: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/14.5.4 Chrome/130.0.6723.137 Electron/33.2.1 Safari/537.36
Viewport: 375x812
URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/LoadingSpinner.cy.tsx
State cleaned - localStorage, sessionStorage, cookies, and IndexedDB cleared
["fail",{"title":"should have proper styling and layout","fullTitle":"LoadingScreen Component should have proper styling and layout","file":null,"duration":10403,"currentRetry":2,"err":"Timed out retrying after 10000ms: expected '<div.css-view-g5y9jx.r-alignItems-1awozwy.r-backgroundColor-1uzerr7.r-borderRadius-1q9bdsx.r-justifyContent-1777fci.r-minHeight-nfz12p.r-minWidth-4ukpa0.r-padding-nsbfu8>' to have CSS property 'background-color' with the value 'rgb(17, 24, 39)', but the value was 'rgb(243, 233, 210)'","stack":"AssertionError: Timed out retrying after 10000ms: expected '<div.css-view-g5y9jx.r-alignItems-1awozwy.r-backgroundColor-1uzerr7.r-borderRadius-1q9bdsx.r-justifyContent-1777fci.r-minHeight-nfz12p.r-minWidth-4ukpa0.r-padding-nsbfu8>' to have CSS property 'background-color' with the value 'rgb(17, 24, 39)', but the value was 'rgb(243, 233, 210)'\n    at Context.<anonymous> (webpack://FantasyWritingApp/./cypress/component/ui/LoadingSpinner.cy.tsx:81:7)"}]
[TEST FAILURE] Timed out retrying after 10000ms: expected '<div.css-view-g5y9jx.r-alignItems-1awozwy.r-backgroundColor-1uzerr7.r-borderRadius-1q9bdsx.r-justifyContent-1777fci.r-minHeight-nfz12p.r-minWidth-4ukpa0.r-padding-nsbfu8>' to have CSS property 'background-color' with the value 'rgb(17, 24, 39)', but the value was 'rgb(243, 233, 210)'
[STACK TRACE] AssertionError: Timed out retrying after 10000ms: expected '<div.css-view-g5y9jx.r-alignItems-1awozwy.r-backgroundColor-1uzerr7.r-borderRadius-1q9bdsx.r-justifyContent-1777fci.r-minHeight-nfz12p.r-minWidth-4ukpa0.r-padding-nsbfu8>' to have CSS property 'background-color' with the value 'rgb(17, 24, 39)', but the value was 'rgb(243, 233, 210)'
    at Context.<anonymous> (webpack://FantasyWritingApp/./cypress/component/ui/LoadingSpinner.cy.tsx:81:7)
Screenshot taken: failed-should-have-proper-styling-and-layout-1758651618363
Failed at URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/LoadingSpinner.cy.tsx
Page title: FantasyWritingApp Component Tests
Visible page text (first 1000 chars): 
    Loading...
  

Found 3 testable elements: [{"data-cy":null,"data-testid":"loading-screen","tagName":"DIV","text":"Loading..."},{"data-cy":null,"data-testid":"loading-screen-ring","tagName":"DIV","text":""},{"data-cy":null,"data-testid":"loading-screen-message","tagName":"DIV","text":"Loading..."}]
Loading indicators found: [data-testid*="loading"]
[CONSOLE WARN] Animated: `useNativeDriver` is not supported because the native animated module is missing. Falling back to JS-based animation. To resolve this, add `RCTAnimation` module to this app, or remove `useNativeDriver`. Make sure to run `bundle exec pod install` first. Read more about autolinking: https://github.com/react-native-community/cli/blob/master/docs/autolinking.md
Factory reset called
[2025-09-23T18:20:19.152Z] Test started: should have proper accessibility attributes
Browser: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/14.5.4 Chrome/130.0.6723.137 Electron/33.2.1 Safari/537.36
Viewport: 375x812
URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/LoadingSpinner.cy.tsx
State cleaned - localStorage, sessionStorage, cookies, and IndexedDB cleared
["pass",{"title":"should have proper accessibility attributes","fullTitle":"LoadingScreen Component should have proper accessibility attributes","file":null,"duration":65,"currentRetry":0}]
Factory reset called
[2025-09-23T18:20:19.238Z] Test started: should handle long loading messages properly
Browser: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/14.5.4 Chrome/130.0.6723.137 Electron/33.2.1 Safari/537.36
Viewport: 375x812
URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/LoadingSpinner.cy.tsx
State cleaned - localStorage, sessionStorage, cookies, and IndexedDB cleared
["pass",{"title":"should handle long loading messages properly","fullTitle":"LoadingScreen Component should handle long loading messages properly","file":null,"duration":65,"currentRetry":0}]
Factory reset called
[2025-09-23T18:20:19.321Z] Test started: should handle empty message gracefully
Browser: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/14.5.4 Chrome/130.0.6723.137 Electron/33.2.1 Safari/537.36
Viewport: 375x812
URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/LoadingSpinner.cy.tsx
State cleaned - localStorage, sessionStorage, cookies, and IndexedDB cleared
["pass",{"title":"should handle empty message gracefully","fullTitle":"LoadingScreen Component should handle empty message gracefully","file":null,"duration":63,"currentRetry":0}]
Factory reset called
[2025-09-23T18:20:19.388Z] Test started: should be responsive to different screen sizes
Browser: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/14.5.4 Chrome/130.0.6723.137 Electron/33.2.1 Safari/537.36
Viewport: 375x812
URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/LoadingSpinner.cy.tsx
State cleaned - localStorage, sessionStorage, cookies, and IndexedDB cleared
["pass",{"title":"should be responsive to different screen sizes","fullTitle":"LoadingScreen Component should be responsive to different screen sizes","file":null,"duration":130,"currentRetry":0}]
Factory reset called
[2025-09-23T18:20:19.536Z] Test started: should have consistent font styling
Browser: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/14.5.4 Chrome/130.0.6723.137 Electron/33.2.1 Safari/537.36
Viewport: 375x812
URL: http://localhost:3003/__cypress/iframes/index.html?specPath=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/component/ui/LoadingSpinner.cy.tsx
State cleaned - localStorage, sessionStorage, cookies, and IndexedDB cleared
