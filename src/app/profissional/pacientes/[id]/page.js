'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '@/app/services/api';
import styles from './patient.module.css';

export default function StudentDetail() {
    const params = useParams();
    const router = useRouter();
    
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [planForm, setPlanForm] = useState({
        title: '',
        type: 'dieta',
        description: '',
        content: [{ refeicao: '', alimentos: '' }]
    });

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await api.get(`/pacientes/${params.id}`);
                setStudent(res.data);
            } catch (error) {
                toast.error('Erro ao carregar dados do aluno');
                router.push('/profissional/dashboard');
            } finally {
                setLoading(false);
            }
        };
        if (params.id) fetchStudent();
    }, [params.id, router]);

    // --- LÓGICA DO FORMULÁRIO DINÂMICO ---
    const addContentRow = () => {
        setPlanForm(prev => ({
            ...prev,
            content: [...prev.content, { refeicao: '', alimentos: '' }]
        }));
    };

    const updateContentRow = (index, field, value) => {
        const newContent = [...planForm.content];
        newContent[index][field] = value;
        setPlanForm(prev => ({ ...prev, content: newContent }));
    };

    const removeContentRow = (index) => {
        const newContent = [...planForm.content];
        newContent.splice(index, 1);
        setPlanForm(prev => ({ ...prev, content: newContent }));
    };

    const handlePlanSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            await api.post('/plans', {
                student_id: parseInt(params.id),
                title: planForm.title,
                type: planForm.type,
                description: planForm.description,
                content: planForm.content
            });
            
            toast.success('Plano enviado com sucesso!');
            setIsModalOpen(false);
            setPlanForm({ title: '', type: 'dieta', description: '', content: [{ refeicao: '', alimentos: '' }] });
        } catch (error) {
            toast.error('Erro ao criar plano.');
        } finally {
            setIsSubmitting(false);
        }
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
    if (!student) return null;

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--foreground)', opacity: 0.6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <ArrowLeft size={16} /> Voltar ao Painel
                </button>

                <div className={styles.header}>
                    <div className={styles.headerInfo}>
                        <h1>{student.name}</h1>
                        <p>Objetivo: {student.patient_details?.objetivo || 'Não definido'}</p>
                    </div>
                    <button className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Criar Plano
                    </button>
                </div>

                <div style={{ padding: '2rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--card-bg)' }}>
                    <h3 style={{ marginTop: 0 }}>Evolução do Aluno</h3>
                    <p style={{ opacity: 0.6 }}>Aqui podes adicionar os gráficos ou histórico do aluno futuramente.</p>
                </div>
            </div>

            {/* MODAL CRIAR PLANO */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0 }}>Novo Plano</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--foreground)', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handlePlanSubmit}>
                            <div className={styles.inputGroup}>
                                <label>Título do Plano</label>
                                <input type="text" required className={styles.inputField} placeholder="Ex: Fase 1 - Hipertrofia"
                                    value={planForm.title} onChange={e => setPlanForm({...planForm, title: e.target.value})} />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Tipo de Plano</label>
                                <select className={styles.selectField} value={planForm.type} onChange={e => setPlanForm({...planForm, type: e.target.value})}>
                                    <option value="dieta">Dieta / Alimentação</option>
                                    <option value="treino">Treino / Exercício</option>
                                    <option value="rotina">Rotina / Hábitos</option>
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Descrição Geral</label>
                                <textarea className={styles.textareaField} placeholder="Foco principal deste plano..."
                                    value={planForm.description} onChange={e => setPlanForm({...planForm, description: e.target.value})} />
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2rem 0' }} />
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>Itens do Plano</h3>
                                <button type="button" className={styles.btnOutline} onClick={addContentRow}>+ Adicionar Item</button>
                            </div>

                            {planForm.content.map((item, index) => (
                                <div key={index} className={styles.contentRow}>
                                    <div style={{ flex: 1 }}>
                                        <input type="text" required className={styles.inputField} placeholder="Ex: Café da Manhã / Exercício 1" style={{ marginBottom: '0.5rem' }}
                                            value={item.refeicao} onChange={e => updateContentRow(index, 'refeicao', e.target.value)} />
                                        
                                        <input type="text" required className={styles.inputField} placeholder="Ex: 3 Ovos / 4x12 Repetições"
                                            value={item.alimentos} onChange={e => updateContentRow(index, 'alimentos', e.target.value)} />
                                    </div>
                                    {planForm.content.length > 1 && (
                                        <button type="button" className={styles.btnDanger} onClick={() => removeContentRow(index)}>
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" className={styles.btnOutline} style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className={styles.btnPrimary} style={{ flex: 2, justifyContent: 'center' }} disabled={isSubmitting}>
                                    {isSubmitting ? 'A Enviar...' : 'Salvar e Enviar Plano'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}