'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '@/app/services/api';
import styles from './marketplace.module.css';

export default function Marketplace() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    
    const [professionals, setProfessionals] = useState([]);
    const [allContents, setAllContents] = useState([]); 
    
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('profissionais'); 
    
    // NOVO: Estado para gerir a cor do tema
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        // 1. Descobrir quem é o utilizador para pintar a página
        if (typeof window !== 'undefined') {
            setUserRole(localStorage.getItem('@user-role') || '');
        }

        const fetchMarketplace = async () => {
            try {
                const res = await api.get('/profissionais');
                const profs = res.data;
                setProfessionals(profs);

                let feed = [];
                for (const p of profs) {
                    try {
                        const contentRes = await api.get(`/profissionais/${p.id}/contents`);
                        const profContents = contentRes.data.map(c => ({ ...c, author: p }));
                        feed = [...feed, ...profContents];
                    } catch (e) { } 
                }
                
                feed.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setAllContents(feed);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchMarketplace();
    }, []);

    const filteredProfs = professionals.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.role?.name && p.role.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredFeed = allContents.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.author.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fadeVariant = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    // A MAGIA DA COR ACONTECE AQUI!
    const isClient = userRole === 'cliente' || userRole === 'paciente';
    const themeColor = isClient ? 'var(--primary-aluno)' : 'var(--primary-prof)';

     if (loading) {
        return (
            <div className={styles.wrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <motion.div
                    // A animação de "piscar/respirar" (vai de 30% a 100% de opacidade e aumenta um pouquinho)
                    animate={{ 
                        opacity: [0.3, 1, 0.3], 
                        scale: [0.9, 1.05, 0.9] 
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <img 
                        src="/Grovy-removebg-preview.png" 
                        alt="A carregar o Grovy..." 
                        style={{ width: '150px', height: '150px', objectFit: 'contain' }} 
                        onError={(e) => e.target.style.display = 'none'} 
                    />
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.wrapper} style={{ '--theme-color': themeColor }}>
            <div className={styles.container}>
                
                <button 
                    onClick={() => router.back()} 
                    style={{ background: 'none', border: 'none', color: 'var(--foreground)', opacity: 0.6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 500 }}
                >
                    <ArrowLeft size={16} /> Voltar
                </button>

                <div className={styles.header}>
                    <h1>Diretório de Profissionais</h1>
                    <p>Encontra o teu especialista ou explora as nossas publicações em saúde e fitness.</p>
                </div>

                <div className={styles.searchContainer}>
                    <input 
                        type="text" 
                        placeholder={activeTab === 'profissionais' ? "Pesquisar por nome ou especialidade..." : "Pesquisar artigos ou autores..."}
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tabBtn} ${activeTab === 'profissionais' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('profissionais')}
                    >
                        Profissionais
                    </button>
                    <button 
                        className={`${styles.tabBtn} ${activeTab === 'feed' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('feed')}
                    >
                        Artigos e Dicas
                    </button>
                </div>

                {/* ABA: PROFISSIONAIS */}
                {activeTab === 'profissionais' && (
                    <motion.div variants={fadeVariant} initial="hidden" animate="show" className={styles.profGrid}>
                        {filteredProfs.length > 0 ? (
                            filteredProfs.map(prof => (
                                <div key={prof.id} className={styles.profCard}>
                                    <div className={styles.avatar}>{prof.name.charAt(0).toUpperCase()}</div>
                                    <h3 className={styles.profName}>{prof.name}</h3>
                                    <span className={styles.profRole}>{prof.role?.name || 'Profissional'}</span>
                                    <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {prof.professional_profile?.bio || 'Sem biografia disponível.'}
                                    </p>
                                    <button className={styles.btnPrimary} onClick={() => router.push(`/profissionais/${prof.id}`)}>
                                        Ver Perfil
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.5 }}>Nenhum profissional encontrado.</div>
                        )}
                    </motion.div>
                )}

                {/* ABA: FEED DE DICAS */}
                {activeTab === 'feed' && (
                    <motion.div variants={fadeVariant} initial="hidden" animate="show" className={styles.feedGrid}>
                        {filteredFeed.length > 0 ? (
                            filteredFeed.map(post => (
                                <div key={post.id} className={styles.postCard}>
                                    <div className={styles.postHeader}>
                                        <div className={styles.postAvatar}>{post.author.name.charAt(0).toUpperCase()}</div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{post.author.name}</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{new Date(post.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <button 
                                            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--theme-color)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', fontWeight: 600 }}
                                            onClick={() => router.push(`/profissionais/${post.author.id}`)}
                                        >
                                            Ver Autor <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                                        </button>
                                    </div>
                                    <div className={styles.postCategory}>{post.category}</div>
                                    <h4 className={styles.postTitle}>{post.title}</h4>
                                    <p className={styles.postBody}>{post.body}</p>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', opacity: 0.5 }}>Nenhuma publicação encontrada.</div>
                        )}
                    </motion.div>
                )}

            </div>
        </div>
    );
}