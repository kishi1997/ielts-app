import type { Exercise } from '@/lib/types'

interface Props {
  exercise: Exercise
}

export default function ExerciseCard({ exercise }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-3 mb-2.5">
      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
        Exercise {exercise.order} · {exercise.topic}
      </div>

      <div className="bg-[#f0f0f5] rounded-lg px-3 py-2.5 text-base leading-[1.75] mb-2.5">
        {exercise.ja_paragraph}
      </div>

      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
        Required Phrases
      </div>
      <div className="mb-2.5">
        {exercise.phrases.map((phrase) => (
          <span
            key={phrase}
            className="inline-block bg-[#e8f0fe] text-[#1a56db] rounded-md px-2 py-0.5 mr-1 mb-1 text-[15px]"
          >
            {phrase}
          </span>
        ))}
      </div>

      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
        Model Answer
      </div>
      <div className="border-l-[3px] border-[#34c759] pl-2.5 text-base leading-[1.75] mb-2.5">
        {exercise.model_answer}
      </div>

      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
        Tips
      </div>
      <div className="bg-[#fff9e6] rounded-lg px-3 py-2 text-[15px] text-[#7a5c00] leading-relaxed">
        <ul className="list-disc pl-4 space-y-0.5">
          {exercise.tips.map((tip) => (
            <li key={tip.phrase}>
              <code className="bg-black/5 rounded px-1 text-sm">{tip.phrase}</code>
              {' → '}
              {tip.synonyms.join(' / ')}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
