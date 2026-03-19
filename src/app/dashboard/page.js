'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Scale, TrendingDown, Activity, Plus, Briefcase, ChevronRight, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import styles from './dashboard.module.css';
import Hero3D from '../components/Hero3D';

export default function Dashboard() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ overview: null, chart: [], history: [], recommendations: [], activePlan: null });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({
        peso: '', waist_cm: '', hips_cm: '', chest_cm: '', notes: '',
        photo_front: null, photo_side: null, photo_back: null
    });

    const [selectedHistory, setSelectedHistory] = useState(null);

    const fetchData = async () => {
        try {
            const [evoRes, measRes, recRes, planRes] = await Promise.all([
                api.get('/dashboard/evolution'),
                api.get('/measurements'),
                api.get('/dashboard/recommendations').catch(() => ({ data: [] })),
                api.get('/my-plan').catch(() => ({ data: null })) // Retorna null se der 404
            ]);

            const labels = evoRes.data.chart?.labels || [];
            const values = evoRes.data.chart?.data || [];

            const chartData = labels.map((label, index) => ({
                name: label,
                peso: Number(values[index]),
                id: index
            }));

            setData({
                overview: evoRes.data.overview,
                chart: chartData,
                history: measRes.data,
                recommendations: recRes.data,
                activePlan: planRes.data // Guardamos o objeto do plano
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleFileChange = (e, field) => {
        setForm(prev => ({ ...prev, [field]: e.target.files[0] }));
    };

    const submitMeasurement = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('peso', form.peso);

        if (form.waist_cm) formData.append('waist_cm', form.waist_cm);
        if (form.hips_cm) formData.append('hips_cm', form.hips_cm);
        if (form.chest_cm) formData.append('chest_cm', form.chest_cm);
        if (form.notes) formData.append('notes', form.notes);

        if (form.photo_front) formData.append('photo_front', form.photo_front);
        if (form.photo_side) formData.append('photo_side', form.photo_side);
        if (form.photo_back) formData.append('photo_back', form.photo_back);

        try {
            await api.post('/measurements', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Avaliação física registada com sucesso!');
            setIsModalOpen(false);
            setForm({ peso: '', waist_cm: '', hips_cm: '', chest_cm: '', notes: '', photo_front: null, photo_side: null, photo_back: null });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erro ao registar a medida.');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
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

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>

                <motion.div variants={containerVariants} initial="hidden" animate="show" className={styles.bentoGrid}>

                    <motion.div variants={itemVariants} className={`${styles.card} ${styles.heroBlock}`}>
                        <div>
                            <h1 className={styles.heroTitle}>Evolução Clínica</h1>
                            <p className={styles.heroSubtitle}>Visão geral do teu progresso e acompanhamento.</p>
                            <button className={styles.btnPrimary} style={{ marginTop: '1.5rem' }} onClick={() => setIsModalOpen(true)}>
                                <Plus size={16} /> Registar Nova Medida
                            </button>
                        </div>
                        <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '350px', height: '350px', zIndex: 1, pointerEvents: 'none' }}>
                            <Hero3D />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className={`${styles.card} ${styles.kpiBlock}`}>
                        <div className={styles.cardTitle}><Scale size={16} color="var(--primary-aluno)" /> Peso Atual</div>
                        <div className={styles.kpiValue}>{data.overview?.peso_atual}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.5rem' }}>Quilogramas (kg)</div>
                    </motion.div>

                    <motion.div variants={itemVariants} className={`${styles.card} ${styles.kpiBlock}`}>
                        <div className={styles.cardTitle}><TrendingDown size={16} color="var(--primary-aluno)" /> Progresso</div>
                        <div className={styles.kpiValue} style={{ color: data.overview?.diferenca <= 0 ? 'var(--primary-aluno)' : '#ef4444' }}>
                            {data.overview?.diferenca > 0 ? '+' : ''}{data.overview?.diferenca}
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.5rem' }}>Variação desde o início</div>
                    </motion.div>

                    {/* BLOCO DO PLANO ATUALIZADO AQUI */}
                    <motion.div variants={itemVariants} className={`${styles.card} ${styles.kpiBlock}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <div className={styles.cardTitle}><Briefcase size={16} color="var(--primary-prof)" /> Meu Plano</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                                {data.activePlan?.title || 'Nenhum plano ativo'}
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.2rem', textTransform: 'capitalize' }}>
                                {data.activePlan?.type || 'Aguardando envio'}
                            </div>
                        </div>
                        <button
                            className={styles.btnOutline}
                            style={{ width: '100%', marginTop: '1rem', padding: '0.5rem', justifyContent: 'center' }}
                            onClick={() => router.push('/dashboard/planos')}
                        >
                            Ver Todos os Planos
                        </button>
                    </motion.div>

                    {/* GRÁFICO RECHARTS */}
                    <motion.div variants={itemVariants} className={`${styles.card} ${styles.chartBlock}`}>
                        <div className={styles.cardTitle}><Activity size={16} color="var(--primary-aluno)" /> Curva de Desempenho</div>
                        <ResponsiveContainer width="100%" height="85%">
                            <AreaChart data={data.chart}>
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary-aluno)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="var(--primary-aluno)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>

                                <XAxis
                                    dataKey="id"
                                    tickFormatter={(value) => data.chart[value]?.name}
                                    stroke="var(--border)"
                                    tick={{ fill: 'var(--foreground)', fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                />

                                <YAxis
                                    stroke="var(--border)"
                                    tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={['dataMin - 1', 'dataMax + 1']}
                                />

                                <Tooltip
                                    trigger="mousemove"
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '6px' }}
                                    labelFormatter={(value) => `Data: ${data.chart[value]?.name}`}
                                    itemStyle={{ color: 'var(--primary-aluno)', fontWeight: 'bold' }}
                                />

                                <Area
                                    type="monotone"
                                    dataKey="peso"
                                    stroke="var(--primary-aluno)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#chartGradient)"
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    connectNulls={true}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* HISTÓRICO */}
                    <motion.div variants={itemVariants} className={`${styles.card} ${styles.sideBlock}`}>
                        <div className={styles.cardTitle}>Últimos Registos</div>
                        <div style={{
                            display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto',
                            paddingRight: '5px'
                        }}>
                            {data.history.map(item => (
                                <div
                                    key={item.id}
                                    className={styles.historyItem}
                                    onClick={() => setSelectedHistory(item)}
                                >
                                    <div>
                                        <div style={{ fontWeight: '600', fontFamily: 'monospace', fontSize: '1.1rem' }}>{item.peso} kg</div>
                                        <div style={{ opacity: 0.5, fontSize: '0.8rem', marginTop: '0.2rem' }}>
                                            {new Date(item.recorded_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} style={{ opacity: 0.3 }} />
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* MARKETPLACE RECOMENDAÇÕES */}
                    <motion.div variants={itemVariants} className={`${styles.card} ${styles.fullBlock}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div className={styles.cardTitle} style={{ marginBottom: 0 }}>Profissionais Recomendados</div>
                            <button
                                className={styles.btnOutline}
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                onClick={() => router.push('/marketplace')}
                            >
                                Ver Todos
                            </button>
                        </div>
                        <div className={styles.profGrid}>
                            {data.recommendations.length > 0 ? (
                                data.recommendations.map(prof => (
                                    <div key={prof.id} className={styles.profCard}>
                                        <div className={styles.profAvatar}>{prof.name ? prof.name.charAt(0).toUpperCase() : 'P'}</div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>{prof.name}</h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6, marginTop: '0.2rem', textTransform: 'uppercase' }}>
                                                {prof.role?.name || 'Profissional'}
                                            </p>
                                        </div>
                                        <button
                                            className={styles.btnOutline}
                                            onClick={() => router.push(`/profissionais/${prof.id}`)}
                                        >
                                            Ver Perfil
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>Nenhuma recomendação disponível no momento.</p>
                            )}
                        </div>
                    </motion.div>

                </motion.div>
            </div>

            {/* MODAL NOVA AVALIAÇÃO */}
            <AnimatePresence>
                {isModalOpen && (
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
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Nova Avaliação</h3>
                                    <p style={{ margin: 0, opacity: 0.6, fontSize: '0.9rem' }}>Regista a tua evolução atual.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--foreground)', cursor: 'pointer' }}><X size={24} /></button>
                            </div>

                            <form onSubmit={submitMeasurement}>
                                <div className={styles.inputGroup}>
                                    <label>Peso Atual (kg) *</label>
                                    <input type="number" step="0.1" required className={styles.inputField} placeholder="Ex: 80.5"
                                        value={form.peso} onChange={e => setForm({ ...form, peso: e.target.value })}
                                    />
                                </div>

                                <div className={styles.modalGrid3}>
                                    <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                        <label>Cintura (cm)</label>
                                        <input type="number" step="0.1" className={styles.inputField} placeholder="Opcional"
                                            value={form.waist_cm} onChange={e => setForm({ ...form, waist_cm: e.target.value })} />
                                    </div>
                                    <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                        <label>Quadril (cm)</label>
                                        <input type="number" step="0.1" className={styles.inputField} placeholder="Opcional"
                                            value={form.hips_cm} onChange={e => setForm({ ...form, hips_cm: e.target.value })} />
                                    </div>
                                    <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                        <label>Peito (cm)</label>
                                        <input type="number" step="0.1" className={styles.inputField} placeholder="Opcional"
                                            value={form.chest_cm} onChange={e => setForm({ ...form, chest_cm: e.target.value })} />
                                    </div>
                                </div>

                                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />

                                <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.8 }}>Fotos de Evolução (Max 5MB)</h4>
                                <div className={styles.modalGrid3}>
                                    <div className={styles.inputGroup}>
                                        <label>Frente</label>
                                        <input type="file" accept="image/*" className={styles.fileInput} onChange={e => handleFileChange(e, 'photo_front')} />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Lado</label>
                                        <input type="file" accept="image/*" className={styles.fileInput} onChange={e => handleFileChange(e, 'photo_side')} />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Costas</label>
                                        <input type="file" accept="image/*" className={styles.fileInput} onChange={e => handleFileChange(e, 'photo_back')} />
                                    </div>
                                </div>

                                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0 1.5rem 0' }} />

                                <div className={styles.inputGroup}>
                                    <label>Anotações do Treino/Dieta</label>
                                    <textarea className={styles.textareaField} placeholder="Como te sentiste esta semana?"
                                        value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button type="button" className={styles.btnOutline} style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                    <button type="submit" className={styles.btnPrimary} style={{ flex: 2, justifyContent: 'center' }}>Guardar Registo Completo</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODAL HISTÓRICO */}
            <AnimatePresence>
                {selectedHistory && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedHistory(null)}
                    >
                        <motion.div
                            className={styles.modalContent}
                            style={{ maxWidth: '600px' }}
                            initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Detalhes da Medição</h3>
                                    <p style={{ margin: 0, opacity: 0.6, fontSize: '0.9rem' }}>
                                        {new Date(selectedHistory.recorded_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedHistory(null)} style={{ background: 'none', border: 'none', color: 'var(--foreground)', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className={styles.modalGrid3}>
                                <div>
                                    <div className={styles.detailLabel}>Peso</div>
                                    <div className={styles.detailValue}>{selectedHistory.peso} kg</div>
                                </div>
                                {selectedHistory.waist_cm && (
                                    <div>
                                        <div className={styles.detailLabel}>Cintura</div>
                                        <div className={styles.detailValue}>{selectedHistory.waist_cm} cm</div>
                                    </div>
                                )}
                                {selectedHistory.hips_cm && (
                                    <div>
                                        <div className={styles.detailLabel}>Quadril</div>
                                        <div className={styles.detailValue}>{selectedHistory.hips_cm} cm</div>
                                    </div>
                                )}
                                {selectedHistory.chest_cm && (
                                    <div>
                                        <div className={styles.detailLabel}>Peito</div>
                                        <div className={styles.detailValue}>{selectedHistory.chest_cm} cm</div>
                                    </div>
                                )}
                            </div>

                            {selectedHistory.notes && (
                                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <div className={styles.detailLabel}>Anotações do Treino/Dieta</div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>{selectedHistory.notes}</p>
                                </div>
                            )}

                            {(selectedHistory.photo_front_path || selectedHistory.photo_side_path || selectedHistory.photo_back_path) && (
                                <>
                                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />
                                    <h4 style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1rem' }}>Fotos de Evolução</h4>
                                    <div className={styles.photoGrid}>
                                        {selectedHistory.photo_front_path && (
                                            <div className={styles.photoBox}>
                                                <img src={`http://localhost:8000/storage/${selectedHistory.photo_front_path}`} alt="Frente" className={styles.photoImage} />
                                            </div>
                                        )}
                                        {selectedHistory.photo_side_path && (
                                            <div className={styles.photoBox}>
                                                <img src={`http://localhost:8000/storage/${selectedHistory.photo_side_path}`} alt="Lado" className={styles.photoImage} />
                                            </div>
                                        )}
                                        {selectedHistory.photo_back_path && (
                                            <div className={styles.photoBox}>
                                                <img src={`http://localhost:8000/storage/${selectedHistory.photo_back_path}`} alt="Costas" className={styles.photoImage} />
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}