import { useMemo } from 'react';
import { OPTIONS } from '../../../helpers/optionManager';
import type { HealthQuestion } from '../../../actions/healthRetro';

export const useQuestionSet = (retroOptions: Record<string, unknown>) => {
  const base = OPTIONS.healthQuestionSet.read(retroOptions);
  const custom = OPTIONS.healthCustomQuestions.read(retroOptions);
  return useMemo(() => {
    let questions = BASE_QUESTIONS.get(base)?.questions ?? [];
    if (custom.length) {
      questions = [...questions];
      for (const customQuestion of custom) {
        const existing = questions.findIndex((q) => q.id === customQuestion.id);
        if (existing !== -1) {
          questions[existing] = customQuestion;
        } else {
          questions.push(customQuestion);
        }
      }
    }
    return questions.filter((q) => q.enabled);
  }, [base, custom]);
};

const BASE_QUESTIONS = new Map<
  string,
  { name: string; questions: HealthQuestion[] }
>([
  ['empty', { name: 'Empty', questions: [] }],
  [
    // adapted from https://engineering.atspotify.com/2014/09/squad-health-check-model
    'generic',
    {
      name: 'Generic',
      questions: [
        {
          id: 'process',
          title: 'Suitable process',
          good: 'Our way of working is a good balance of rigour and flexibility.',
          bad: 'There are too many useless hurdles in our day-to-day work, or too much chaos and inconsistency.',
          enabled: true,
        },
        {
          id: 'quality',
          title: 'High quality work',
          good: 'We\u2019re proud of what we make! New joiners get going quickly and mistakes are caught reliably.',
          bad: 'Our output is full of problems beneath-the-surface and it is difficult to have any confidence in it.',
          enabled: true,
        },
        {
          id: 'value',
          title: 'Useful output',
          good: 'We make great stuff! We\u2019re proud of it, our customers like it, and our stakeholders are really happy.',
          bad: 'We\u2019re not helping anyone with what we produce. We feel embarrassed to deliver it.',
          enabled: true,
        },
        {
          id: 'release',
          title: 'Easy to release',
          good: 'Once we\u2019ve finished our work, getting the result into customers\u2019 hands is simple, safe, and painless.',
          bad: 'Releasing is risky, painful, lots of manual work, and takes forever.',
          enabled: true,
        },
        {
          id: 'speed',
          title: 'Quick turnaround',
          good: 'We get stuff done and available to customers really quickly. No waiting, no delays.',
          bad: 'Nothing seems to get delivered to customers. We keep getting stuck or interrupted. Work gets held up on dependencies.',
          enabled: true,
        },
        {
          id: 'support',
          title: 'Help & support',
          good: 'We can rely on support from other teams, stakeholders, and external providers whenever we need it.',
          bad: 'We are frequently stuck because we can\u2019t get the support and help that we ask for.',
          enabled: true,
        },
        {
          id: 'fun',
          title: 'Having fun',
          good: 'We love going to work, and have great fun working together.',
          bad: 'Work is overwhelming or boring.',
          enabled: true,
        },
        {
          id: 'learning',
          title: 'Learning',
          good: 'There are lots of opportunities to learn new and interesting things.',
          bad: 'We never have time to learn anything. Mistakes are made due to a lack of understanding.',
          enabled: true,
        },
        {
          id: 'mission',
          title: 'Worthwhile mission',
          good: 'We know exactly why we are here, and we are really excited about it.',
          bad: 'There is no high level picture or focus. The goals of the team are unclear or uninspiring. Priorities change at random.',
          enabled: true,
        },
        {
          id: 'autonomy',
          title: 'Autonomy',
          good: 'We are in control of our own destiny. We decide what we make and how we make it.',
          bad: 'We have to do things which make no sense, or are pointless. We have no influence to change anything.',
          enabled: true,
        },
      ],
    },
  ],
]);
