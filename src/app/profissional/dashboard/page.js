'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, CheckCircle, Clock, ChevronRight, Activity, PenTool, X, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '@/app/services/api';
import styles from './professional.module.css'
import Hero3D from '@/app/components/Hero3D';

export default function ProfissionalDashboard() {
    const router = useRouter();
    
    // --- ESTADOS DO MODAL E LOADING ---
    const [isContentModalOpen, setIsContentModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // NOVO: Protege contra cliques duplos!
    const [contentForm, setContentForm] = useState({ title: '', category: '', body: '' });
    
    // --- ESTADOS DOS DADOS ---
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        activeStudents: [],
        pendingContracts: [],
        contents: [], // NOVO: Array para guardar as tuas dicas!
        overview: { total_alunos: 0, pendentes: 0 }
    });

    // --- FETCH DATA PRINCIPAL ---
    const fetchData = async () => {
        try {
            // 1. Vamos buscar o ID do utilizador que guardámos no login
            // (Se o nome da chave for diferente no teu projeto, ajusta aqui)
            const userId = localStorage.getItem('@user-id');

            if (!userId) {
                console.error("ID do utilizador não encontrado no localStorage!");
                // Opcional: router.push('/login');
            }

            // 2. Fazemos as chamadas com a TUA rota correta injetando o ID
            const [pacientesRes, contratosRes, contentsRes] = await Promise.all([
                api.get('/pacientes'),
                api.get('/contracts/requests').catch(() => ({ data: [] })), // <--- A ROTA CORRETA
                api.get(`/profissionais/${userId}/contents`).catch(() => ({ data: [] })) 
            ]);

            const alunos = pacientesRes.data || [];
            const pendentes = contratosRes.data || [];
            const dicas = contentsRes.data || [];

            setData({
                activeStudents: alunos,
                pendingContracts: pendentes,
                contents: dicas, 
                overview: {
                    total_alunos: alunos.length,
                    pendentes: pendentes.length
                }
            });
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar dados do painel.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- LÓGICA DE CRIAR DICA (COM PROTEÇÃO) ---
    const handleContentSubmit = async (e) => {
        e.preventDefault();
        
        // Se já estiver a enviar, bloqueia a função e não faz nada
        if (isSubmitting) return; 
        
        setIsSubmitting(true); // Bloqueia o botão

        try {
            await api.post('/contents', contentForm);
            toast.success('Dica de marketing partilhada com sucesso!');
            setIsContentModalOpen(false);
            setContentForm({ title: '', category: '', body: '' });
            fetchData(); // Atualiza a página para a nova dica aparecer na lista lá em baixo!
        } catch (error) {
            toast.error('Erro ao partilhar a dica. Verifica os dados.');
        } finally {
            setIsSubmitting(false); // Desbloqueia o botão independentemente do resultado
        }
    };

    // --- LÓGICA DE ACEITAR CONTRATO ---
    const handleAcceptContract = async (contractId) => {
        try {
            await api.patch(`/contracts/${contractId}/accept`);
            toast.success('Aluno aceite com sucesso!');
            fetchData(); 
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erro ao aceitar contrato.');
        }
    };

    const handleViewStudent = (studentId) => {
        router.push(`/profissional/pacientes/${studentId}`);
    };

    // Animações
    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
    const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

    if (loading) return <div className={styles.wrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Sincronizando gestão...</div>;

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>

                <motion.div variants={containerVariants} initial="hidden" animate="show" className={styles.bentoGrid}>

                    {/* HERO SECTION */}
                    <motion.div
                        variants={itemVariants}
                        className={`${styles.card} ${styles.heroBlock}`}
                        style={{ justifyContent: 'flex-end', textAlign: 'right' }}
                    >
                        <div style={{ position: 'absolute', left: '-50px', top: '-50px', width: '350px', height: '350px', zIndex: 1, pointerEvents: 'none', opacity: 0.6 }}>
                            <Hero3D color="#3b82f6" />
                        </div>
                        <div style={{ zIndex: 2, position: 'relative' }}>
                            <h1 className={styles.heroTitle}>Painel de Gestão</h1>
                            <p className={styles.heroSubtitle}>Acompanha os teus alunos e gere novas solicitações.</p>
                        </div>
                    </motion.div>

                    {/* KPIs */}
                    <motion.div variants={itemVariants} className={`${styles.card} ${styles.kpiBlock}`}>
                        <div className={styles.cardTitle}><Users size={16} color="var(--primary-prof)" /> Alunos Ativos</div>
                        <div className={styles.kpiValue} style={{ color: 'var(--primary-prof)' }}>
                            {data.overview.total_alunos}
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.5rem' }}>Acompanhamentos em curso</div>
                    </motion.div>

                    <motion.div variants={itemVariants} className={`${styles.card} ${styles.kpiBlock}`}>
                        <div className={styles.cardTitle}><UserPlus size={16} color="#f59e0b" /> Solicitações Pendentes</div>
                        <div className={styles.kpiValue}>{data.overview.pendentes}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.5rem' }}>A aguardar tua aprovação</div>
                    </motion.div>

                    {/* KPI MARKETING (SUBSTITUIU ENGAJAMENTO) */}
                    <motion.div variants={itemVariants} className={`${styles.card} ${styles.kpiBlock}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div className={styles.cardTitle} style={{ marginBottom: '1rem' }}><PenTool size={16} color="var(--primary-prof)" /> Marketing</div>
                        <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1rem' }}>Partilha dicas de saúde para engajar os alunos.</p>
                        <button
                            className={styles.btnOutline}
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={() => setIsContentModalOpen(true)}
                        >
                            Escrever Nova Dica
                        </button>
                    </motion.div>

                    {/* FILA DE ESPERA */}
                    <motion.div variants={itemVariants} className={`${styles.card} ${styles.requestsBlock} ${styles.scrollArea}`}>
                        <div className={styles.cardTitle}><Clock size={16} color="#f59e0b" /> Aguardando Aprovação</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {data.pendingContracts.length > 0 ? (
                                data.pendingContracts.map(req => (
                                    <div key={req.id} className={styles.userItem}>
                                        <div className={styles.userInfo}>
                                            <div className={styles.avatar}>
                                                {req.paciente?.name ? req.paciente.name.charAt(0).toUpperCase() : 'A'}
                                            </div>
                                            <div>
                                                <div className={styles.userName}>{req.paciente?.name || 'Aluno'}</div>
                                                <div className={styles.userDetails}>Solicitou acompanhamento</div>
                                            </div>
                                        </div>
                                        <div className={styles.actionGroup}>
                                            <button
                                                className={styles.btnAccept}
                                                onClick={() => handleAcceptContract(req.id)}
                                                title="Aceitar Aluno"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '2rem 0', textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>Nenhuma solicitação pendente.</div>
                            )}
                        </div>
                    </motion.div>

                    {/* ALUNOS ATIVOS */}
                    <motion.div variants={itemVariants} className={`${styles.card} ${styles.studentsBlock} ${styles.scrollArea}`}>
                        <div className={styles.cardTitle}><CheckCircle size={16} color="var(--primary-prof)" /> Meus Alunos</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {data.activeStudents.length > 0 ? (
                                data.activeStudents.map(aluno => (
                                    <div key={aluno.id} className={styles.userItem} style={{ marginBottom: 0 }}>
                                        <div className={styles.userInfo}>
                                            <div className={styles.avatar}>
                                                {aluno.name ? aluno.name.charAt(0).toUpperCase() : 'A'}
                                            </div>
                                            <div>
                                                <div className={styles.userName}>{aluno.name}</div>
                                                <div className={styles.userDetails}>
                                                    Objetivo: {aluno.patient_details?.objetivo || 'Não definido'}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className={styles.btnOutline}
                                            onClick={() => handleViewStudent(aluno.id)}
                                        >
                                            Detalhes <ChevronRight size={14} style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div style={{ gridColumn: '1 / -1', padding: '3rem 0', textAlign: 'center', opacity: 0.5 }}>Ainda não tens alunos ativos.</div>
                            )}
                        </div>
                    </motion.div>

                    {/* NOVO BLOCO: DICAS PUBLICADAS */}
                    <motion.div variants={itemVariants} className={`${styles.card} ${styles.fullBlock}`}>
                        <div className={styles.cardTitle}><FileText size={16} color="var(--primary-prof)" /> Meus Conteúdos (Dicas)</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {data.contents.length > 0 ? (
                                data.contents.map(dica => (
                                    <div key={dica.id} style={{ 
                                        padding: '1.5rem', 
                                        border: '1px solid var(--border)', 
                                        borderRadius: '8px', 
                                        backgroundColor: 'var(--background)' 
                                    }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-prof)', marginBottom: '0.5rem' }}>
                                            {dica.category}
                                        </div>
                                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{dica.title}</h4>
                                        <p style={{ 
                                            margin: 0, fontSize: '0.9rem', opacity: 0.7, 
                                            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' 
                                        }}>
                                            {dica.body}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div style={{ gridColumn: '1 / -1', padding: '2rem 0', textAlign: 'center', opacity: 0.5 }}>
                                    Ainda não publicaste conteúdos. Usa o botão de Marketing acima!
                                </div>
                            )}
                        </div>
                    </motion.div>

                </motion.div>
            </div>

            {/* O MODAL DE CRIAR DICA */}
            <AnimatePresence>
                {isContentModalOpen && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className={styles.modalContent}
                            initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Nova Dica</h3>
                                    <p style={{ margin: 0, opacity: 0.6, fontSize: '0.9rem' }}>Conteúdo para o teu perfil e alunos.</p>
                                </div>
                                <button onClick={() => setIsContentModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--foreground)', cursor: 'pointer' }}><X size={24} /></button>
                            </div>

                            <form onSubmit={handleContentSubmit}>
                                <div className={styles.inputGroup}>
                                    <label>Título da Dica</label>
                                    <input type="text" required className={styles.inputField} placeholder="Ex: A importância da Água"
                                        value={contentForm.title} onChange={e => setContentForm({ ...contentForm, title: e.target.value })}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Categoria</label>
                                    <input type="text" required className={styles.inputField} placeholder="Ex: Saúde, Treino, Nutrição"
                                        value={contentForm.category} onChange={e => setContentForm({ ...contentForm, category: e.target.value })}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Conteúdo</label>
                                    <textarea required className={styles.textareaField} placeholder="Escreve aqui o teu conhecimento..."
                                        value={contentForm.body} onChange={e => setContentForm({ ...contentForm, body: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button type="button" className={styles.btnOutline} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsContentModalOpen(false)}>Cancelar</button>
                                    {/* AQUI ESTÁ A PROTEÇÃO CONTRA CLIQUES DUPLOS */}
                                    <button type="submit" className={styles.btnAccept} style={{ flex: 2, justifyContent: 'center' }} disabled={isSubmitting}>
                                        {isSubmitting ? 'A Publicar...' : 'Publicar Conteúdo'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}