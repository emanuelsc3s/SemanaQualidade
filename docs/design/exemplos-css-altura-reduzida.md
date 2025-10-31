# Exemplos de CSS para Ajustes de Altura Reduzida

## 📋 Visão Geral

Este documento contém exemplos completos de código CSS para implementar ajustes responsivos em telas com altura reduzida (≤800px).

---

## 🎨 Template Base - Media Query

### Estrutura Completa no `src/index.css`

```css
/* Adaptações para telas com altura reduzida (≤800px) */
@media (max-height: 800px) {
  
  /* ========== Adaptações para Hero (Home.tsx) ========== */
  
  /* Container principal do Hero */
  .hero-content-short {
    padding-top: 6rem !important; /* Compensa header fixo */
    gap: 1.5rem !important; /* Reduz espaço entre elementos */
  }
  
  /* Título principal */
  .hero-title-short {
    font-size: 44px !important; /* Reduzido de 60px */
    line-height: 1.1 !important;
    margin-bottom: 1rem !important;
  }
  
  /* Subtítulo */
  .hero-subtitle-short {
    font-size: 18px !important; /* Reduzido de 20px */
    margin-bottom: 1.5rem !important;
  }
  
  /* Botões CTA */
  .hero-button-short {
    height: 56px !important; /* Reduzido de 60px */
    font-size: 18px !important; /* Aumentado de 16px para legibilidade */
    padding: 0 2rem !important;
  }
  
  /* Vídeo de fundo - ajusta posição para mostrar rosto da atleta */
  .hero-video-short {
    object-position: center 70% !important; /* Mostra parte inferior do vídeo */
  }
  
  
  /* ========== Adaptações para LoginInscricao.tsx ========== */
  
  /* Container principal da página de login */
  .login-container-short {
    padding: 0.5rem !important; /* Reduz padding vertical para eliminar scroll */
  }
  
  /* Logo FARMACE no topo */
  .login-logo-short {
    height: 2.5rem !important; /* 40px - reduzido de 64px */
    margin-bottom: 1rem !important; /* Reduz espaço abaixo */
  }
  
  /* Botão Voltar */
  .login-back-button-short {
    margin-bottom: 0.75rem !important; /* Reduz margem */
    height: 2rem !important; /* 32px */
    font-size: 0.875rem !important; /* 14px */
  }
  
  /* Card de Login */
  .login-card-short {
    padding: 0 !important;
  }
  
  /* Header do Card */
  .login-card-header-short {
    padding: 1rem !important; /* Reduz padding */
    gap: 0.25rem !important;
  }
  
  /* Título do Card */
  .login-card-title-short {
    font-size: 1.25rem !important; /* 20px - reduzido de 24px */
    margin-bottom: 0.25rem !important;
  }
  
  /* Subtítulo do Card */
  .login-card-subtitle-short {
    font-size: 0.875rem !important; /* 14px */
  }
  
  /* Content do Card */
  .login-card-content-short {
    padding: 1rem !important; /* Reduz padding */
  }
  
  /* Form - espaçamento entre campos */
  .login-form-short {
    gap: 0.75rem !important; /* Reduz espaço entre campos */
  }
  
  /* Campos de input (matrícula e senha) */
  .login-input-short {
    height: 2.5rem !important; /* 40px - reduzido de 48px */
    font-size: 0.875rem !important; /* 14px */
  }
  
  /* Labels dos campos */
  .login-label-short {
    font-size: 0.875rem !important; /* 14px */
    margin-bottom: 0.25rem !important;
  }
  
  /* Ícones dentro dos inputs */
  .login-input-icon-short {
    width: 1rem !important; /* 16px - reduzido de 20px */
    height: 1rem !important;
  }
  
  /* Mensagem de erro */
  .login-error-short {
    padding: 0.5rem !important; /* Reduz padding */
    font-size: 0.75rem !important; /* 12px */
  }
  
  /* Botão de Login (Entrar) */
  .login-submit-button-short {
    height: 2.5rem !important; /* 40px - reduzido de 48px */
    font-size: 0.875rem !important; /* 14px */
  }
  
  /* Link de ajuda abaixo do botão */
  .login-help-link-short {
    margin-top: 0.5rem !important;
    font-size: 0.75rem !important; /* 12px */
  }
  
  /* Informações adicionais (Termos de Uso) */
  .login-footer-short {
    margin-top: 1rem !important; /* Reduz margem */
    font-size: 0.75rem !important; /* 12px */
  }
  
  /* Botão de Ajuda Flutuante */
  .login-help-button-short {
    padding: 0.5rem 1rem !important; /* Reduz padding */
    font-size: 0.75rem !important; /* 12px */
  }
  
  /* Logo Mobile */
  .login-mobile-logo-short {
    height: 2rem !important; /* 32px - reduzido de 48px */
    margin-bottom: 0.5rem !important;
  }
  
  /* Título Mobile */
  .login-mobile-title-short {
    font-size: 1.5rem !important; /* 24px - reduzido de 32px */
    margin-bottom: 1rem !important;
  }
  
  /* Seção do vídeo lateral */
  .login-video-section-short {
    padding: 1.5rem !important; /* Reduz padding */
  }
  
  /* Título sobre o vídeo */
  .login-video-title-short {
    font-size: 1.5rem !important; /* 24px - reduzido de 32px */
    margin-bottom: 0.25rem !important;
  }
  
  /* Subtítulo sobre o vídeo */
  .login-video-subtitle-short {
    font-size: 1rem !important; /* 16px - reduzido de 20px */
  }
  
  /* Modal de Ajuda - reduz tamanhos */
  .login-help-modal-title-short {
    font-size: 1.125rem !important; /* 18px - reduzido de 24px */
  }
  
  .login-help-modal-content-short {
    padding: 1rem !important; /* Reduz padding */
    gap: 0.75rem !important;
  }
  
  .login-help-modal-heading-short {
    font-size: 0.875rem !important; /* 14px */
  }
  
  .login-help-modal-text-short {
    font-size: 0.75rem !important; /* 12px */
  }
  
  .login-help-modal-button-short {
    margin-top: 0.5rem !important;
    height: 2.5rem !important; /* 40px */
  }
}
```

---

## 🔧 Exemplos de Aplicação em Componentes React

### Exemplo 1: Hero Section (Home.tsx)

```tsx
// src/pages/Home.tsx

export default function Home() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Vídeo de fundo */}
      <video
        className="hero-video-short absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/0104.mp4" type="video/mp4" />
      </video>

      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Conteúdo */}
      <div className="hero-content-short relative z-10 text-center text-white px-4 pt-32 flex flex-col items-center gap-6">
        {/* Título */}
        <h1 className="hero-title-short text-6xl font-bold mb-6 drop-shadow-lg">
          2ª Corrida e Caminhada da Qualidade
        </h1>

        {/* Subtítulo */}
        <p className="hero-subtitle-short text-xl mb-8 max-w-2xl drop-shadow-md">
          Participe do maior evento esportivo da FARMACE durante a Semana da Qualidade 2025
        </p>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="hero-button-short h-[60px] text-base bg-primary-600 hover:bg-primary-700">
            Inscreva-se Agora
          </Button>
          <Button className="hero-button-short h-[60px] text-base bg-accent-400 hover:bg-accent-500">
            Saiba Mais
          </Button>
        </div>
      </div>
    </section>
  );
}
```

### Exemplo 2: Formulário de Login (LoginInscricao.tsx)

```tsx
// src/pages/LoginInscricao.tsx

export default function LoginInscricao() {
  return (
    <div className="login-container-short min-h-screen p-4 flex">
      {/* Seção do vídeo lateral (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <video className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted>
          <source src="/0104.mp4" type="video/mp4" />
        </video>
        
        <div className="login-video-section-short relative z-10 flex flex-col justify-end p-12 text-white">
          <h1 className="login-video-title-short mb-0 drop-shadow-lg font-bold" style={{ fontSize: '32px' }}>
            II Corrida - 2025
          </h1>
          <p className="login-video-subtitle-short text-xl text-white/90 drop-shadow-md">
            Faça seu login para realizar a inscrição
          </p>
        </div>
      </div>

      {/* Seção do formulário */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Logo desktop */}
        <img
          src="https://farmace.com.br/wp-content/uploads/2023/12/cropped-big-logo-farmace.png"
          alt="Farmace"
          className="login-logo-short hidden lg:block h-16 mb-6"
        />

        {/* Botão Voltar */}
        <Button className="login-back-button-short mb-4 h-8 text-sm">
          Voltar para Home
        </Button>

        {/* Card de Login */}
        <Card className="login-card-short w-full max-w-md mx-auto">
          <CardHeader className="login-card-header-short p-6 space-y-1">
            <CardTitle className="login-card-title-short text-2xl font-bold">
              Seja Bem-Vindo!
            </CardTitle>
            <p className="login-card-subtitle-short text-sm text-slate-600">
              Entre com suas credenciais para continuar
            </p>
          </CardHeader>

          <CardContent className="login-card-content-short p-6">
            <form className="login-form-short space-y-6">
              {/* Campo Matrícula */}
              <div className="space-y-2">
                <Label htmlFor="matricula" className="login-label-short text-slate-700 font-medium">
                  Matrícula
                </Label>
                <div className="relative">
                  <User className="login-input-icon-short absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="matricula"
                    type="text"
                    placeholder="Digite sua matrícula"
                    className="login-input-short pl-10 h-12"
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <Label htmlFor="senha" className="login-label-short text-slate-700 font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="login-input-icon-short absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="senha"
                    type="password"
                    placeholder="••••••••"
                    className="login-input-short pl-10 h-12"
                  />
                </div>
              </div>

              {/* Botão de Login */}
              <Button
                type="submit"
                className="login-submit-button-short w-full h-12 bg-primary-600 hover:bg-primary-700"
              >
                Entrar
              </Button>

              {/* Link de ajuda */}
              <div className="login-help-link-short mt-4 text-center">
                <button type="button" className="text-primary-600 hover:underline text-sm">
                  Precisa de ajuda para fazer login?
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="login-footer-short mt-6 text-center text-sm text-slate-600">
          <p>
            Ao fazer login, você concorda com nossos{" "}
            <a href="#" className="text-primary-600 hover:underline">Termos de Uso</a>
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## 📐 Template para Nova Página

Use este template como ponto de partida para ajustar uma nova página:

```css
/* ========== Adaptações para [NomeDaPagina].tsx ========== */

/* Container principal */
.[pagina]-container-short {
  padding: 0.5rem !important;
}

/* Títulos */
.[pagina]-title-short {
  font-size: 1.5rem !important; /* 24px */
  margin-bottom: 0.5rem !important;
}

.[pagina]-subtitle-short {
  font-size: 1rem !important; /* 16px */
  margin-bottom: 0.5rem !important;
}

/* Inputs e campos de formulário */
.[pagina]-input-short {
  height: 2.5rem !important; /* 40px */
  font-size: 0.875rem !important; /* 14px */
}

.[pagina]-label-short {
  font-size: 0.875rem !important; /* 14px */
  margin-bottom: 0.25rem !important;
}

/* Botões */
.[pagina]-button-short {
  height: 2.5rem !important; /* 40px */
  font-size: 0.875rem !important; /* 14px */
}

/* Espaçamentos */
.[pagina]-section-short {
  padding: 1rem !important;
  gap: 0.75rem !important;
}

/* Textos auxiliares */
.[pagina]-text-short {
  font-size: 0.75rem !important; /* 12px */
}
```

---

## 🎯 Dicas de Otimização

### 1. Priorize a Redução de Espaçamentos

Antes de reduzir tamanhos de fonte, tente reduzir:
- Padding vertical dos containers
- Gaps entre elementos
- Margins entre seções

### 2. Mantenha Hierarquia Visual

Mesmo com tamanhos reduzidos, mantenha a diferença proporcional entre:
- Títulos principais vs secundários
- Botões primários vs secundários
- Textos normais vs auxiliares

### 3. Use Unidades Relativas (rem)

Prefira `rem` para facilitar ajustes globais:

```css
/* Melhor */
.element-short {
  padding: 0.5rem !important;
  font-size: 0.875rem !important;
}

/* Evitar */
.element-short {
  padding: 8px !important;
  font-size: 14px !important;
}
```

### 4. Teste Incrementalmente

Ao ajustar uma página:
1. Comece com reduções conservadoras (10-15%)
2. Teste e verifique scroll
3. Aumente reduções gradualmente se necessário
4. Pare quando atingir 0px de scroll

---

## 📊 Conversão de Unidades

### Pixels para REM (base 16px)

| Pixels | REM | Uso Comum |
|--------|-----|-----------|
| 12px | 0.75rem | Texto muito pequeno |
| 14px | 0.875rem | Texto pequeno, labels |
| 16px | 1rem | Texto base |
| 18px | 1.125rem | Texto médio |
| 20px | 1.25rem | Subtítulos |
| 24px | 1.5rem | Títulos H3 |
| 32px | 2rem | Títulos H2 |
| 40px | 2.5rem | Inputs, botões |
| 44px | 2.75rem | Títulos H1 reduzidos |
| 48px | 3rem | Inputs/botões normais |
| 56px | 3.5rem | Botões grandes reduzidos |
| 60px | 3.75rem | Botões grandes normais |

---

## ✅ Checklist de Implementação

Ao criar ajustes para uma nova página:

- [ ] Criar seção comentada no `src/index.css` dentro da media query
- [ ] Definir classes para container principal
- [ ] Definir classes para títulos (H1, H2, H3)
- [ ] Definir classes para inputs e labels
- [ ] Definir classes para botões (primário, secundário)
- [ ] Definir classes para textos auxiliares
- [ ] Definir classes para espaçamentos (padding, gap, margin)
- [ ] Aplicar classes nos componentes React
- [ ] Testar em 1400x600
- [ ] Testar em 1400x700
- [ ] Testar em 1400x800
- [ ] Verificar que 1400x900 não foi afetado
- [ ] Verificar que 1920x1080 não foi afetado
- [ ] Confirmar scroll vertical = 0px
- [ ] Verificar legibilidade de todos os textos
- [ ] Verificar clicabilidade de todos os botões
- [ ] Documentar classes criadas

---

**Última atualização:** 2025-10-31  
**Versão:** 1.0.0  
**Autor:** Emanuel (Desenvolvedor)

