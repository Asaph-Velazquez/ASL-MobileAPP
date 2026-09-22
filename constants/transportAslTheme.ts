export const transportAslColors = {
  people: { color: '#087F8C', background: '#E0F5F4' },
  luggageYes: { color: '#2E7D32', background: '#E8F5E9' },
  luggageNo: { color: '#C23C32', background: '#FCE9E7' },
  destination: { color: '#2468B4', background: '#E8F1FC' },
  help: { color: '#926800', background: '#FFF3CF' },
};

export function transportTimeAppearance(time: string) {
  const hour = Number(time.split(':')[0]);
  if (hour >= 6 && hour < 12) return {
    label: 'MORNING / AM', icon: 'wb-sunny' as const, color: '#A86B00', background: '#FFF3CF',
  };
  if (hour >= 12 && hour < 18) return {
    label: 'AFTERNOON / PM', icon: 'wb-sunny' as const, color: '#C45A14', background: '#FFF0DF',
  };
  if (hour >= 18 && hour < 20) return {
    label: 'EVENING / PM', icon: 'wb-twilight' as const, color: '#B65339', background: '#FDE8DE',
  };
  return {
    label: hour < 12 ? 'NIGHT / AM' : 'NIGHT / PM', icon: 'nightlight-round' as const, color: '#4458B0', background: '#E8ECFF',
  };
}
