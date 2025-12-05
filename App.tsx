import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Database from './pages/Database';
import AddSong from './pages/AddSong';
import SongDetail from './pages/SongDetail';
import Interactive from './pages/Interactive';
import { DataProvider } from './context/DataContext';

const App: React.FC = () => {
  return (
    <DataProvider>
        <HashRouter>
        <Layout>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/database" element={<Database />} />
            <Route path="/add" element={<AddSong />} />
            <Route path="/song/:id" element={<SongDetail />} />
            <Route path="/interactive" element={<Interactive />} />
            </Routes>
        </Layout>
        </HashRouter>
    </DataProvider>
  );
};

export default App;