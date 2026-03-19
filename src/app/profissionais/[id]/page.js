'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, Send, Mail, CheckCircle, Briefcase } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '@/app/services/api';
import styles from './profile.module.css';

export default function ProfessionalProfile() {
    const params = useParams();
    const router = useRouter();
    
    const [loading, setLoading] = useState(true);
    const [professional, setProfessional] = useState(null);
    const [contents, setContents] = useState([]);
    const [isRequesting, setIsRequesting] = useState(false);
    
    // NOVO: Estado para saber quem está a ver a página
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        // NOVO: Pegamos a role guardada no login
        if (typeof window !== 'undefined') {
            setUserRole(localStorage.getItem('@user-role') || '');
        }

        const fetchProfileData = async () => {
            try {
                const [profRes, contentsRes] = await Promise.all([
                    api.get(`/profissionais/${params.id}`),
                    api.get(`/profissionais/${params.id}/contents`).catch(() => ({ data: [] }))
                ]);

                setProfessional(profRes.data);
                setContents(contentsRes.data);
            } catch (error) {
                console.error(error);
                toast.error('Erro ao carregar o perfil do profissional.');
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchProfileData();
        }
    }, [params.id, router]);

    const handleRequestContract = async () => {
        setIsRequesting(true);
        try {
            await api.post('/contracts', { 
                professional_id: parseInt(params.id) 
            });
            toast.success('Solicitação enviada com sucesso! O profissional foi notificado.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ocorreu um erro ao solicitar acompanhamento.');
        } finally {
            setIsRequesting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
    };

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
    if (!professional) return null;

    return (
        <div className={styles.wrapper}>
            
            <div style={{ maxWidth: '1000px', margin: '0 auto 1.5rem auto', padding: '0 1rem' }}>
                <button 
                    onClick={() => router.back()} 
                    style={{ background: 'none', border: 'none', color: 'var(--foreground)', opacity: 0.6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}
                >
                    <ArrowLeft size={16} /> Voltar ao Painel
                </button>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className={styles.container}>
                
                {/* COLUNA ESQUERDA: SIDEBAR / CARTÃO DE VISITA */}
                <motion.div variants={itemVariants} className={styles.sidebar}>
                    <div className={styles.avatar}>
                        {professional.name ? professional.name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    
                    <h1 className={styles.name}>{professional.name}</h1>
                    <span className={styles.roleBadge}>{professional.role?.name || 'Profissional'}</span>

                    {/* NOVO: Condição para esconder o botão se não for cliente/paciente */}
                    {(userRole === 'cliente' || userRole === 'paciente') && (
                        <button 
                            className={styles.btnContract} 
                            onClick={handleRequestContract}
                            disabled={isRequesting}
                        >
                            {isRequesting ? 'A Enviar...' : <>Solicitar Acompanhamento <Send size={16} /></>}
                        </button>
                    )}

                    <div className={styles.metaInfo}>
                        {professional.professional_profile?.registro_profissional && (
                            <div className={styles.metaRow}>
                                <CheckCircle size={16} color="var(--primary-prof)" />
                                <span>Registro: <strong>{professional.professional_profile.registro_profissional}</strong></span>
                            </div>
                        )}
                        <div className={styles.metaRow}>
                            <Briefcase size={16} color="var(--primary-prof)" />
                            <span>Atendimento Online</span>
                        </div>
                        <div className={styles.metaRow}>
                            <Mail size={16} color="var(--primary-prof)" />
                            <span>{professional.email}</span>
                        </div>
                    </div>
                </motion.div>

                {/* COLUNA DIREITA: BIO E CONTEÚDOS */}
                <motion.div variants={itemVariants} className={styles.mainContent}>
                    
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>
                            <Briefcase size={18} color="var(--primary-prof)"/> Resumo Profissional
                        </h3>
                        <p className={styles.bioText}>
                            {professional.professional_profile?.bio || 'Este profissional ainda não adicionou um resumo ao seu perfil.'}
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>
                            <FileText size={18} color="var(--primary-prof)"/> Conteúdos e Artigos
                        </h3>
                        
                        <div className={styles.tipsGrid}>
                            {contents.length > 0 ? (
                                contents.map(dica => (
                                    <div key={dica.id} className={styles.tipCard}>
                                        <div className={styles.tipCategory}>{dica.category}</div>
                                        <h4 className={styles.tipTitle}>{dica.title}</h4>
                                        <p className={styles.tipBody}>{dica.body}</p>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, border: '1px dashed var(--border)', borderRadius: '4px' }}>
                                    Nenhum artigo publicado no momento.
                                </div>
                            )}
                        </div>
                    </div>

                </motion.div>

            </motion.div>
        </div>
    );
}