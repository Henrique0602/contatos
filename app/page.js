// app/page.js - EVOLUÇÃO do projeto existente
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import ContactForm from "./components/ContactForm";
import ContactList from "./components/ContactList";
import FilterInput from "./components/FilterInput";
import Statistcs from "./components/Statistcs";
import api from "@/utils/api";

const HomePage = () => {
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  // Carregar contatos da API + localStorage
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Tentar carregar da API primeiro
        try {
          const response = await api.get('/contacts');
          setContacts(response.data);
          // Salvar no localStorage como cache
          localStorage.setItem('contatos', JSON.stringify(response.data));
          setIsOffline(false);
        } catch (apiError) {
          // Se API falhar, carregar do localStorage
          console.log('API offline, carregando do cache');
          setIsOffline(true);
          const cached = localStorage.getItem('contatos');
          if (cached) {
            setContacts(JSON.parse(cached));
          } else {
            setError('Erro ao carregar contatos e sem cache disponível.');
          }
        }
      } catch (err) {
        setError('Erro ao carregar contatos');
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  // MANTER: localStorage do projeto existente
  useEffect(() => {
    if (contacts.length > 0) {
      localStorage.setItem('contatos', JSON.stringify(contacts));
    }
  }, [contacts]);

  // MANTER: Lista filtrada otimizada (useMemo da aula anterior)
  const filteredContacts = useMemo(() => {
    if (!filter.trim()) {
      return contacts;
    }
    
    return contacts.filter(contact =>
      contact.nome.toLowerCase().includes(filter.toLowerCase()) ||
      contact.email.toLowerCase().includes(filter.toLowerCase()) ||
      contact.telefone.includes(filter)
    );
  }, [contacts, filter]);

  // MANTER: Estatísticas memoizadas (useMemo da aula anterior)
  const stats = useMemo(() => {
    const total = contacts.length;
    const comEmail = contacts.filter(c => c.email).length;
    const comTelefone = contacts.filter(c => c.telefone).length;
    
    return {
      total,
      comEmail,
      comTelefone,
      semEmail: total - comEmail,
      semTelefone: total - comTelefone
    };
  }, [contacts]);

  // MANTER: Handlers memoizados do projeto existente
  const handleSubmit = useCallback((newContact) => {
    setContacts(prev => [...prev, newContact]);
  }, []);

  const handleRemove = useCallback((id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleFilterChange = useCallback((value) => {
    setFilter(value);
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Cadastro de Contatos</h1>
          <div className="flex items-center space-x-4">
            <FilterInput value={filter} onChange={handleFilterChange} />
            {isOffline && (
              <span className="text-orange-600 text-sm">
                <i className="fas fa-exclamation-triangle"></i> Offline
              </span>
            )}
          </div>
        </header>

        <ContactForm onAdd={handleSubmit} />

        {loading && (
          <div className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-2xl text-blue-600"></i>
            <p className="mt-2">Carregando contatos...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <i className="fas fa-exclamation-circle text-2xl text-red-600"></i>
            <p className="mt-2 text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {!loading && !error && (
          <ContactList items={filteredContacts} onRemove={handleRemove} />
        )}

        <Statistcs stats={stats} />
      </div>
    </div>
  );
};

export default HomePage;