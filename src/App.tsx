import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthProvider from "./contexts/AuthContext";
import { SearchProvider } from "./contexts/SearchContext";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Contribute from "./pages/Contribute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import "./App.css";

const WordDetails = lazy(() => import("./pages/WordDetails"));
const Admin = lazy(() => import("./pages/Admin"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const CommunityReview = lazy(() => import("./pages/CommunityReview"));
const FirebaseTest = lazy(() => import("./pages/FirebaseTest"));
const AdminDebug = lazy(() => import("./pages/AdminDebug"));
const LikeTestPage = lazy(() => import("./pages/LikeTestPage"));
const HighlightTestPage = lazy(() => import("./pages/HighlightTestPage"));
const WordReviewDemo = lazy(() => import("./pages/WordReviewDemo"));
const KurukhEditor = lazy(() => import("./pages/KurukhEditor"));

const Spinner = (
  <div className="flex justify-center p-10">
    <span className="loading loading-spinner loading-lg"></span>
  </div>
);

const Lazy = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={Spinner}>{children}</Suspense>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <SearchProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/word/:wordId"
                element={
                  <Lazy>
                    <WordDetails />
                  </Lazy>
                }
              />
              <Route path="/contribute" element={<Contribute />} />
              <Route
                path="/review"
                element={
                  <ProtectedRoute>
                    <Lazy>
                      <CommunityReview />
                    </Lazy>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Lazy>
                      <UserProfile />
                    </Lazy>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Lazy>
                      <Admin />
                    </Lazy>
                  </AdminRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              {import.meta.env.DEV && (
                <Route
                  path="/firebase-test"
                  element={
                    <Lazy>
                      <FirebaseTest />
                    </Lazy>
                  }
                />
              )}
              {import.meta.env.DEV && (
                <Route
                  path="/admin-debug"
                  element={
                    <Lazy>
                      <AdminDebug />
                    </Lazy>
                  }
                />
              )}
              {import.meta.env.DEV && (
                <Route
                  path="/like-test"
                  element={
                    <Lazy>
                      <LikeTestPage />
                    </Lazy>
                  }
                />
              )}
              {import.meta.env.DEV && (
                <Route
                  path="/highlight-test"
                  element={
                    <Lazy>
                      <HighlightTestPage />
                    </Lazy>
                  }
                />
              )}
              {import.meta.env.DEV && (
                <Route
                  path="/word-review-demo"
                  element={
                    <Lazy>
                      <WordReviewDemo />
                    </Lazy>
                  }
                />
              )}
              <Route
                path="/kurukh-editor"
                element={
                  <Lazy>
                    <KurukhEditor />
                  </Lazy>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </SearchProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
