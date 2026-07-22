UPDATE daily_exercises
SET exercises = json_set(
  exercises,
  '$.vocab[0].exampleJa', 'その数値は期間を通じて40%から55%の間で変動した。',
  '$.vocab[1].exampleJa', '学生の大きな割合がオンライン授業を好んだ。',
  '$.vocab[2].exampleJa', '回答者のおよそ70%が公共交通機関を選んだ。',
  '$.vocab[3].exampleJa', '車の利用は増えた一方で、バスの利用は減少した。',
  '$.vocab[4].exampleJa', '再生可能エネルギーは総生産量の30%を占めた。',
  '$.vocab[5].exampleJa', '訪問者数は2018年以降減少した。',
  '$.vocab[6].exampleJa', '売上は2022年に1億2000万ドルでピークに達した。',
  '$.vocab[7].exampleJa', '失業率は約5%で安定していた。',
  '$.vocab[8].exampleJa', '教育支出には著しい増加が見られた。',
  '$.vocab[9].exampleJa', '全体として、再生可能エネルギーの利用は着実に増加した。'
)
WHERE date = '2026-07-18';
