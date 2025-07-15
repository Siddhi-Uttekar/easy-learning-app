import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { Provider } from 'react-redux'
import { store } from './store'
import { routeTree } from './routeTree.gen'
import { Toaster } from 'sonner'
import { MathJaxContext } from 'better-react-mathjax'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'

// Create router
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Mount the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <Provider store={store}>
        <Toaster richColors position="top-center" />
        <MathJaxContext>
          <RouterProvider router={router} />
        </MathJaxContext>
      </Provider>
    </StrictMode>,
  )
}

reportWebVitals()
