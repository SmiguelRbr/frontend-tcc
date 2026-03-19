'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Dumbbell, Apple, Calendar, FileText, X, User, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '@/app/services/api';
import styles from './planos.module.css';

export default function MeusPlanos() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await api.get('/my-plans-history');
                setPlans(res.data);
            } catch (error) {
                console.error(error);
                toast.error('Erro ao carregar o teu histórico de planos.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const getPlanIcon = (type) => {
        switch (type) {
            case 'treino': return <Dumbbell size={18} color="var(--primary-aluno)" />;
            case 'dieta': return <Apple size={18} color="var(--primary-aluno)" />;
            default: return <Calendar size={18} color="var(--primary-aluno)" />;
        }
    };

    // Função que chama a impressão/geração de PDF nativa do navegador
    const handleDownloadPDF = () => {
        window.print();
    };

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

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
        <div className={styles.wrapper}>
            <div className={styles.container}>
                
                <button 
                    onClick={() => router.back()} 
                    style={{ background: 'none', border: 'none', color: 'var(--foreground)', opacity: 0.6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 500 }}
                >
                    <ArrowLeft size={16} /> Voltar ao Painel
                </button>

                <div className={styles.header}>
                    <div className={styles.headerInfo}>
                        <h1>Ficheiro Clínico</h1>
                        <p>O teu histórico completo de prescrições e acompanhamentos.</p>
                    </div>
                    <FileText size={40} color="var(--primary-aluno)" opacity={0.3} />
                </div>

                <motion.div variants={containerVariants} initial="hidden" animate="show" className={styles.grid}>
                    {plans.length > 0 ? (
                        plans.map(plan => (
                            <motion.div 
                                key={plan.id} 
                                variants={itemVariants} 
                                className={styles.card}
                                onClick={() => setSelectedPlan(plan)}
                            >
                                <div className={styles.cardHeader}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', fontWeight: '700', fontSize: '0.8rem', opacity: 0.8 }}>
                                        {getPlanIcon(plan.type)} {plan.type}
                                    </div>
                                    <span className={`${styles.badge} ${plan.active ? styles.badgeActive : styles.badgeInactive}`}>
                                        {plan.active ? 'Vigente' : 'Arquivado'}
                                    </span>
                                </div>
                                
                                <h3 className={styles.planTitle}>{plan.title}</h3>
                                
                                <div className={styles.planProf}>
                                    <User size={14} /> 
                                    Prescrito por: {plan.professional?.name || 'Profissional'}
                                </div>

                                <div style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '0.8rem' }}>
                                    Emitido em: {new Date(plan.created_at).toLocaleDateString()}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', opacity: 0.5, border: '1px dashed var(--border)', borderRadius: '4px' }}>
                            Sem registos no teu ficheiro clínico de momento.
                        </div>
                    )}
                </motion.div>
            </div>

            {/* MODAL DOCUMENTO OFICIAL (A4) */}
            <AnimatePresence>
                {selectedPlan && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedPlan(null)}
                    >
                        <motion.div
                            className={styles.modalContent}
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Barra de Ferramentas (Fica fora da impressão) */}
                            <div className={styles.modalToolbar}>
                                <button className={styles.btnActionOutline} onClick={() => setSelectedPlan(null)}>
                                    <X size={20} /> Fechar
                                </button>
                                <button className={styles.btnAction} onClick={handleDownloadPDF}>
                                    <Download size={16} /> Salvar PDF
                                </button>
                            </div>

                            {/* Cabeçalho do Documento */}
                            <div className={styles.documentHeader}>
                                <div>
                                    <h2 className={styles.docTitle}>Prescrição</h2>
                                    <div className={styles.docSubtitle}>Tipo: {selectedPlan.type}</div>
                                </div>
                                <div className={styles.docMeta}>
                                    <strong>Emissor:</strong> {selectedPlan.professional?.name || 'Profissional'}<br/>
                                    <strong>Documento:</strong> #{selectedPlan.id}<br/>
                                    <strong>Data:</strong> {new Date(selectedPlan.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Corpo do Documento */}
                            <div className={styles.documentBody}>
                                <h3 style={{ fontSize: '1.4rem', margin: '0 0 1.5rem 0' }}>{selectedPlan.title}</h3>

                                {selectedPlan.description && (
                                    <div className={styles.docDescription}>
                                        <strong>Notas Clínicas:</strong><br/><br/>
                                        {selectedPlan.description}
                                    </div>
                                )}

                                {/* Tabela Formal */}
                                <table className={styles.docTable}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40%' }}>Etapa / Refeição</th>
                                            <th>Prescrição / Alimentos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(selectedPlan.content) ? (
                                            selectedPlan.content.map((item, index) => (
                                                <tr key={index}>
                                                    <td style={{ fontWeight: '600' }}>{item.refeicao}</td>
                                                    <td>{item.alimentos}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="2" style={{ textAlign: 'center', opacity: 0.5 }}>Formato inválido.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Assinatura Digital */}
                                <div className={styles.signatureBlock}>
                                    <div className={styles.signatureLine}></div>
                                    <strong>{selectedPlan.professional?.name || 'Assinatura do Profissional'}</strong>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.2rem' }}>Aprovado Digitalmente via Grovy</div>
                                </div>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}