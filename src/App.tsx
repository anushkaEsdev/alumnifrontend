import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import { ConnectionTest } from '@/components/ConnectionTest';

// Lazy load pages
const Home = React.lazy(() => import('@/pages/Home'));
const Blog = React.lazy(() => import('@/pages/Blog'));
const Events = React.lazy(() => import('@/pages/Events'));
const InterviewQuestions = React.lazy(() => import('@/pages/InterviewQuestions'));
const OurTeam = React.lazy(() => import('@/pages/OurTeam'));
const About = React.lazy(() => import('@/pages/About'));
const Login = React.lazy(() => import('@/pages/Login'));
const Register = React.lazy(() => import('@/pages/Register'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const ProfileSettings = React.lazy(() => import('@/pages/ProfileSettings'));
const CreatePost = React.lazy(() => import('@/pages/CreatePost'));
const EditPost = React.lazy(() => import('@/pages/EditPost'));
const Post = React.lazy(() => import('@/pages/Post'));
const Event = React.lazy(() => import('@/pages/Event'));
const Question = React.lazy(() => import('@/pages/Question'));
const Search = React.lazy(() => import('@/pages/Search'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));
const Terms = React.lazy(() => import('@/pages/Terms'));
const Privacy = React.lazy(() => import('@/pages/Privacy'));
const Contact = React.lazy(() => import('@/pages/Contact'));
const CreateEvent = React.lazy(() => import('@/pages/CreateEvent'));
const CreateQuestion = React.lazy(() => import('@/pages/CreateQuestion'));

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow pt-16">
              {/* Temporary connection test component */}
              <div className="container mx-auto px-4 py-8">
                <ConnectionTest />
              </div>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/create" element={<CreatePost />} />
                  <Route path="/blog/edit/:id" element={<EditPost />} />
                  <Route path="/blog/:id" element={<Post />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/create" element={<CreateEvent />} />
                  <Route path="/events/:id" element={<Event />} />
                  <Route path="/interview-questions" element={<InterviewQuestions />} />
                  <Route path="/interview-questions/create" element={<CreateQuestion />} />
                  <Route path="/interview-questions/:id" element={<Question />} />
                  <Route path="/directory" element={<OurTeam />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/settings" element={<ProfileSettings />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <Toaster position="bottom-right" />
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
