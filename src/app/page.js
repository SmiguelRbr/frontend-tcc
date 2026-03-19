'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Activity, Image as ImageIcon } from 'lucide-react';
import styles from './page.module.css';
import Image from 'next/image';

export default function Home() {
    // Variáveis de animação
    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.2 } }
    };

    return (
        <div className={styles.wrapper}>
            
            {/* NAVBAR */}
            <nav className={styles.navbar}>
                <h1 className={styles.logo}>Grovy</h1>
                <div className={styles.navLinks}>
                    <Link href="/login" className={styles.loginBtn}>Entrar</Link>
                    <Link href="/cadastro" className={styles.registerBtn}>Criar Conta</Link>
                </div>
            </nav>

            {/* HERO SECTION */}
            <main className={styles.hero}>
                
                {/* Lado Esquerdo: Texto e Botões */}
                <motion.div 
                    className={styles.heroContent}
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div variants={fadeUp} className={styles.badge}>
                        <Activity size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                        O teu ecossistema de saúde
                    </motion.div>
                    
                    <motion.h2 variants={fadeUp} className={styles.title}>
                        A ponte definitiva entre <span>Profissionais</span> e <span>Resultados</span>.
                    </motion.h2>
                    
                    <motion.p variants={fadeUp} className={styles.subtitle}>
                        O Grovy conecta-te aos melhores nutricionistas e personal trainers. Gere as tuas avaliações físicas, recebe planos de treino e dieta, e acompanha a tua evolução num só lugar.
                    </motion.p>
                    
                    <motion.div variants={fadeUp} className={styles.buttonGroup}>
                        <Link href="/cadastro" className={styles.btnPrimary}>
                            Começar a minha jornada
                        </Link>
                        <Link href="/marketplace" className={styles.btnOutline}>
                            Explorar Profissionais
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Lado Direito: O espaço para a tua Foto/Mockup */}
               {/* Lado Direito: A tua Foto em Alta Resolução */}
                <motion.div 
                    className={styles.heroImage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <div style={{ width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'center' }}>
                        <Image
                            src="/Grovy-removebg-preview.png" 
                            alt="Dashboard do Grovy" 
                            width={1000} // Resolução base de largura
                            height={800} // Resolução base de altura
                            priority // Diz ao Next para carregar esta imagem primeiro (é a da capa!)
                            style={{ 
                                width: '80%', 
                                height: 'auto', 
                                objectFit: 'contain', // Evita que a imagem seja cortada ou esticada feio
                                borderRadius: '12px',
                                filter: 'drop-shadow(0 20px 25px rgba(0, 0, 0, 0.25))'
                            }} 
                        />
                    </div>
                </motion.div>

            </main>
        </div>
    );
}