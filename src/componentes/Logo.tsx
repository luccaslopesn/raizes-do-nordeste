/** Marca: sol do sertão sobre raiz, desenhado como carimbo de xilogravura */
export function SimboloSol({ tamanho = 40 }: { tamanho?: number }) {
  const raios = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill="#a63d1e" stroke="#2a1d15" strokeWidth="2" />
      {raios.map((angulo) => (
        <rect key={angulo} x="23" y="5" width="2" height="6" rx="1" fill="#f2b33d" transform={`rotate(${angulo} 24 24)`} />
      ))}
      <circle cx="24" cy="24" r="9" fill="#f2b33d" stroke="#2a1d15" strokeWidth="1.5" />
      <path d="M24 33v8M24 37l-5 4M24 37l5 4" stroke="#fbf5ea" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Logo({ tamanho = 40, compacto = false }: { tamanho?: number; compacto?: boolean }) {
  return (
    <span className="logo">
      <SimboloSol tamanho={tamanho} />
      {!compacto && (
        <span className="logo-texto">
          <span className="logo-nome">Raízes</span>{' '}
          <span className="logo-sub">do Nordeste</span>
        </span>
      )}
    </span>
  );
}
