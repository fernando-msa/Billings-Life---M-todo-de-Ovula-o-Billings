import {
  DailyLog,
  Cycle,
  ClinicalProfile,
  FertilityAlert,
  StampType,
  FertilityPhase,
  VulvarSensation,
  MucusAppearance,
  BleedingLevel,
} from '../types/billings';

// Human-readable labels in Portuguese
export const SENSATION_LABELS: Record<VulvarSensation, { label: string; desc: string }> = {
  seca: { label: 'Seca', desc: 'Sensação nítida de secura vulvar contínua' },
  sem_sensacao: { label: 'Sem Sensação', desc: 'Ausência perceptível de umidade ou secura' },
  umida: { label: 'Úmida', desc: 'Leve percepção de umidade sem sensação escorregadia' },
  molhada: { label: 'Molhada', desc: 'Sensação aquosa evidente ao caminhar ou sentar' },
  escorregadia: { label: 'Escorregadia', desc: 'Sensação deslizante, sedosa, de alta lubricidade' },
  lubrificada: { label: 'Lubrificada / Inchada', desc: 'Sensação máxima de lubrificação e plenitude vulvar' },
};

export const APPEARANCE_LABELS: Record<MucusAppearance, { label: string; desc: string }> = {
  nada_visivel: { label: 'Nada Visível', desc: 'Papel higiênico limpo, sem muco' },
  opaco_pastoso: { label: 'Opaco / Pastoso', desc: 'Espesso, esbranquiçado ou sem elasticidade' },
  leitoso_branco: { label: 'Leitoso / Branco', desc: 'Aspecto de loção ou leite, cremoso' },
  turvo_amarelado: { label: 'Turvo / Amarelado', desc: 'Coloração amarela ou esbranquiçada turva' },
  elastico_filante: { label: 'Elástico / Filante', desc: 'Estica entre os dedos sem romper (Spinnbarkeit)' },
  transparente_clara_ovo: { label: 'Transparente (Clara de ovo)', desc: 'Cristalino, brilhante, muito fluido' },
  sanguinolento: { label: 'Com Traços de Sangue', desc: 'Spotting ou muco róseo/amarronzado' },
};

export const BLEEDING_LABELS: Record<BleedingLevel, string> = {
  nenhum: 'Nenhum sangramento',
  spotting: 'Spotting (gotas/marrom)',
  leve: 'Menstruação Leve',
  moderado: 'Menstruação Moderada',
  intenso: 'Menstruação Intensa / Abundante',
};

export const STAMP_DETAILS: Record<StampType, { name: string; bg: string; text: string; icon: string; description: string }> = {
  red: {
    name: 'Selo Vermelho',
    bg: 'bg-rose-500',
    text: 'text-white',
    icon: '🩸',
    description: 'Sangramento menstrual ou spotting',
  },
  green: {
    name: 'Selo Verde',
    bg: 'bg-emerald-600',
    text: 'text-white',
    icon: '🌿',
    description: 'Secura / PBI de ausência de muco (Infértil)',
  },
  yellow_plain: {
    name: 'Selo Amarelo Liso',
    bg: 'bg-amber-400',
    text: 'text-slate-900',
    icon: '☀️',
    description: 'PBI de muco constante e inalterado (Infértil)',
  },
  yellow_baby: {
    name: 'Selo Amarelo com Bebê',
    bg: 'bg-amber-300',
    text: 'text-slate-900',
    icon: '👶',
    description: 'Muco constante em transição ou potencialmente fértil',
  },
  white_baby: {
    name: 'Selo Branco com Bebê',
    bg: 'bg-white border-2 border-slate-300',
    text: 'text-slate-900',
    icon: '👶',
    description: 'Muco fértil em evolução, escorregadio ou elástico',
  },
};

/**
 * Recommends the official stamp type based on log values and diagnosed BIP
 */
export function suggestStampType(
  bleeding: BleedingLevel,
  sensation: VulvarSensation,
  appearance: MucusAppearance,
  diagnosedBip: 'secura' | 'muco_constante' | 'em_investigacao'
): StampType {
  // Any bleeding takes precedent
  if (bleeding !== 'nenhum') {
    return 'red';
  }

  // Highly fertile sensations or appearances
  if (
    sensation === 'escorregadia' ||
    sensation === 'lubrificada' ||
    sensation === 'molhada' ||
    appearance === 'elastico_filante' ||
    appearance === 'transparente_clara_ovo'
  ) {
    return 'white_baby';
  }

  // Pure dryness or no sensation
  if (sensation === 'seca' || (sensation === 'sem_sensacao' && appearance === 'nada_visivel')) {
    return 'green';
  }

  // Constant unchanged mucus diagnosed as BIP
  if (diagnosedBip === 'muco_constante') {
    if (appearance === 'opaco_pastoso' || appearance === 'leitoso_branco') {
      return 'yellow_plain';
    }
  }

  // Evolving mucus or unknown pattern
  if (appearance !== 'nada_visivel' || sensation === 'umida') {
    return 'white_baby';
  }

  return 'green';
}

/**
 * Scans a cycle's logs in chronological order to detect:
 * 1. Peak Day (the last day of slippery/fertile sensation followed by abrupt dry/non-fertile shift)
 * 2. 1-2-3 count after peak
 * 3. BIP interruptions and 1-2-3 count of interruption
 */
export function recalculateCyclePhases(logs: DailyLog[], profile: ClinicalProfile): DailyLog[] {
  if (!logs || logs.length === 0) return [];

  // Sort logs by cycleDay ascending
  const sorted = [...logs].sort((a, b) => a.cycleDay - b.cycleDay);

  // First pass: locate candidate for Peak Day
  // WOOMB definition: The Peak is the LAST day of slippery/lubricated sensation or fertile-type mucus.
  // It is only recognized retroactively on the following day when there is an abrupt shift back to dryness or BIP.
  let peakDay: number | null = null;

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    const isCurrentFertile =
      current.sensation === 'escorregadia' ||
      current.sensation === 'lubrificada' ||
      current.appearance === 'elastico_filante' ||
      current.appearance === 'transparente_clara_ovo';

    const isNextAbruptShift =
      next.sensation === 'seca' ||
      next.sensation === 'sem_sensacao' ||
      (next.sensation === 'umida' && next.appearance === 'opaco_pastoso') ||
      next.stamp === 'green' ||
      next.stamp === 'yellow_plain';

    if (isCurrentFertile && isNextAbruptShift) {
      // Check if subsequent 3 days remain non-slippery
      peakDay = current.cycleDay;
    }
  }

  let inLutealPhase = false;
  let interruptionCounter = 0;

  return sorted.map((log) => {
    const updated = { ...log };

    // Reset flags
    updated.isPeak = false;
    updated.postPeakCount = null;
    updated.interruptionCount = null;

    // Menstruation (Bleeding present)
    if (updated.bleeding !== 'nenhum') {
      updated.phase = 'menstruation';
      interruptionCounter = 0;
      return updated;
    }

    // Peak day
    if (peakDay !== null && updated.cycleDay === peakDay) {
      updated.isPeak = true;
      updated.phase = 'peak';
      interruptionCounter = 0;
      return updated;
    }

    // Post-peak days 1, 2, 3
    if (peakDay !== null && updated.cycleDay > peakDay) {
      const diff = updated.cycleDay - peakDay;
      if (diff === 1) {
        updated.postPeakCount = 1;
        updated.phase = 'post_peak_count';
        return updated;
      } else if (diff === 2) {
        updated.postPeakCount = 2;
        updated.phase = 'post_peak_count';
        return updated;
      } else if (diff === 3) {
        updated.postPeakCount = 3;
        updated.phase = 'post_peak_count';
        return updated;
      } else {
        // 4th day onwards post-peak is complete luteal phase
        inLutealPhase = true;
        updated.phase = 'luteal_infertile';
        return updated;
      }
    }

    // Before peak: Is it BIP or Evolving / Interruption?
    if (!inLutealPhase) {
      const isFertileSign =
        updated.sensation === 'escorregadia' ||
        updated.sensation === 'lubrificada' ||
        updated.sensation === 'molhada' ||
        updated.appearance === 'elastico_filante' ||
        updated.appearance === 'transparente_clara_ovo';

      if (isFertileSign) {
        updated.phase = 'fertile_evolving';
        interruptionCounter = 0;
      } else {
        // Check if it's pure BIP
        const isDryOrBip =
          updated.sensation === 'seca' ||
          (updated.sensation === 'sem_sensacao' && updated.appearance === 'nada_visivel') ||
          (profile.diagnosedBipType === 'muco_constante' && updated.stamp === 'yellow_plain');

        if (isDryOrBip) {
          updated.phase = 'bip';
        } else {
          // Interruption of BIP
          interruptionCounter++;
          updated.phase = 'interruption';
          if (interruptionCounter <= 3) {
            updated.interruptionCount = interruptionCounter as 1 | 2 | 3;
          }
        }
      }
    }

    return updated;
  });
}

/**
 * Evaluates fertility status and actionable advice for a specific day according to the 4 Billings Rules.
 */
export function getFertilityAlertForDay(
  log: DailyLog | undefined,
  profile: ClinicalProfile,
  previousLogs: DailyLog[]
): FertilityAlert {
  const isAvoid = profile.goal === 'avoid_pregnancy';
  const isAchieve = profile.goal === 'achieve_pregnancy';

  if (!log) {
    return {
      status: 'possibly_fertile',
      title: 'Aguardando Registro de Hoje',
      description: 'Observe as sensações vulvares ao longo de todas as atividades cotidianas antes de registrar ao deitar.',
      billingsRuleApplied: 'Regra de Observação: Sentir ao longo do dia e registrar à noite.',
      coitusRecommendation: isAvoid
        ? 'Evite relações até que a observação diária esteja concluída.'
        : 'Aguarde o registro para verificar a janela fértil.',
      badgeColor: 'blue',
    };
  }

  // 1. Menstruation - Rule 1
  if (log.bleeding !== 'nenhum') {
    return {
      status: 'bleeding_rule1',
      title: 'Sangramento Menstrual / Spotting',
      description:
        'A ovulação pode ocorrer precocemente em ciclos curtos e o sangue menstrual mascara a presença do muco cervical fértil.',
      billingsRuleApplied: 'Primeira Regra dos Primeiros Dias: Evitar relações nos dias de sangramento abundante.',
      coitusRecommendation: isAvoid
        ? 'Evite relações sexuais em todos os dias de sangramento intenso.'
        : 'Período não ideal para concepção; reserve energia para o surgimento do muco fértil.',
      badgeColor: 'rose',
    };
  }

  // 2. Peak Day
  if (log.isPeak) {
    return {
      status: 'fertile',
      title: 'Ápice Identificado (Máxima Fertilidade)',
      description:
        'O Ápice marca o auge da resposta estrogênica. A ovulação ocorre no Ápice ou dentro de 48 horas após ele.',
      billingsRuleApplied: 'Regra do Ápice: O óvulo é liberado neste período e vive até 24 horas.',
      coitusRecommendation: isAvoid
        ? 'ABSTENÇÃO TOTAL: Relações hoje têm altíssima probabilidade de gravidez.'
        : 'MOMENTO ÓTIMO: Período de máxima fertilidade para conseguir gravidez!',
      badgeColor: isAvoid ? 'rose' : 'emerald',
    };
  }

  // 3. Post-Peak Days 1, 2, 3
  if (log.postPeakCount) {
    return {
      status: 'possibly_fertile',
      title: `Dia ${log.postPeakCount} Pós-Ápice (Contagem 1, 2, 3)`,
      description:
        'Contagem obrigatória dos 3 dias pós-ápice. O óvulo pode ser liberado até 48h após o Ápice e permanecer viável por até 24h.',
      billingsRuleApplied: `Regra do Ápice (Contagem Dia ${log.postPeakCount}/3): A fertilidade permanece aberta até o 4º dia pós-ápice.`,
      coitusRecommendation: isAvoid
        ? `Abstenção obrigatória até a 4ª manhã após o Ápice (mais ${4 - log.postPeakCount} dia(s)).`
        : 'Relações ainda podem resultar em concepção se a ovulação ocorreu tardiamente pós-ápice.',
      badgeColor: 'amber',
    };
  }

  // 4. Absolute Infertile Luteal Phase (Day 4+ after Peak until next menses)
  if (log.phase === 'luteal_infertile') {
    return {
      status: 'infertile_luteal',
      title: 'Fase Lútea Confirmada (Infertilidade Absoluta)',
      description:
        'A ovulação já foi concluída e o óvulo já não está mais viável. Os níveis de progesterona fecharam o colo do útero.',
      billingsRuleApplied: 'Fase Pós-Ápice Consolidada: Liberado a qualquer hora do dia ou da noite até a menstruação.',
      coitusRecommendation: isAvoid
        ? 'Relações permitidas a qualquer hora sem risco de gravidez até a próxima menstruação.'
        : 'Janela fértil encerrada neste ciclo; a fertilidade retomará no próximo ciclo menstrual.',
      badgeColor: 'emerald',
    };
  }

  // 5. Fertile / Evolving mucus before peak
  if (log.phase === 'fertile_evolving' || log.stamp === 'white_baby') {
    return {
      status: 'fertile',
      title: 'Período Fértil em Evolução',
      description:
        'Presença de sensação de umidade/lubrificação ou muco elástico/transparente. Os espermatozoides podem sobreviver na presença deste muco por até 3 a 5 dias nas criptas cervicais.',
      billingsRuleApplied: 'Fase Fértil: O estrogênio está em ascensão preparando o folículo.',
      coitusRecommendation: isAvoid
        ? 'Evite relações sexuais e qualquer contato genital até 3 dias após o Ápice se deseja espaçar gravidez.'
        : 'Janela fértil aberta! Relações neste período favorecem a concepção com alta qualidade de muco.',
      badgeColor: isAvoid ? 'rose' : 'emerald',
    };
  }

  // 6. BIP Interruption (Rule 3)
  if (log.phase === 'interruption') {
    const count = log.interruptionCount || 1;
    return {
      status: 'interruption_rule3',
      title: `Mudança no PBI - Aguardando 1, 2, 3 (Dia ${count})`,
      description:
        'Houve uma alteração na sensação ou no muco que interrompeu o PBI. Deve-se aguardar 3 dias completos de PBI reestabelecido.',
      billingsRuleApplied: 'Terceira Regra dos Primeiros Dias: Aguardar 3 dias de PBI reestabelecido antes de retomar a Regra 2.',
      coitusRecommendation: isAvoid
        ? 'Evite relações. Se o PBI continuar estável por 3 dias, a relação estará liberada na 4ª noite.'
        : 'Fique atenta: esta alteração pode ser o início do muco fértil da ovulação.',
      badgeColor: 'amber',
    };
  }

  // 7. Base Infertile Pattern (BIP / PBI) - Rule 2
  // Check if yesterday had coitus to enforce alternate nights
  const hadCoitusYesterday = previousLogs.some(
    (l) => l.cycleDay === log.cycleDay - 1 && l.coitus !== 'nenhum'
  );

  if (hadCoitusYesterday) {
    return {
      status: 'infertile_rule2',
      title: 'Dia Seguinte à Relação (Dia de Observação)',
      description:
        'Hoje é o dia de descanso após a relação noturna. O fluido seminal pode estar presente na vulva e não se deve ter relação para não mascarar um início de muco fértil.',
      billingsRuleApplied: 'Segunda Regra dos Primeiros Dias: Noites alternadas para permitir observação limpa.',
      coitusRecommendation: isAvoid
        ? 'Evite relações hoje à noite. A relação estará permitida amanhã à noite se o PBI persistir.'
        : 'PBI infértil.',
      badgeColor: 'blue',
    };
  }

  return {
    status: 'infertile_rule2',
    title: 'PBI Reconhecido (Noite Alternada Liberada)',
    description:
      'Padrão Básico de Infertilidade mantido ao longo de todo o dia. Colo uterino ocluído por tampão mucoso denso.',
    billingsRuleApplied: 'Segunda Regra dos Primeiros Dias: Relação sexual permitida somente à noite.',
    coitusRecommendation: isAvoid
      ? 'Relação permitida hoje À NOITE (somente à noite, pois o dia foi observado e o PBI confirmado).'
      : 'Dia infértil. Guarde para o momento em que a sensação mudar para lubrificada/escorregadia.',
    badgeColor: 'emerald',
  };
}
