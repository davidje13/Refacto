import type { ReactNode } from 'react';
import FaceHappy from '../../../../resources/face-happy.svg';
import FaceMeh from '../../../../resources/face-meh.svg';
import FaceSad from '../../../../resources/face-sad.svg';
import FaceBlank from '../../../../resources/face-blank.svg';
import type { AnswerID } from '../../../shared/health';

interface AnswerDef {
  id: AnswerID;
  label: string;
  icon: ReactNode;
  flatIcon: ReactNode;
}

export const ANSWERS: AnswerDef[] = [
  {
    id: 'good',
    label: 'Good',
    icon: '\uD83D\uDE03',
    flatIcon: (
      <FaceHappy
        className="answer-icon good"
        role="img"
        aria-label="good"
        title="good"
      />
    ),
  },
  {
    id: 'mid',
    label: 'Middling',
    icon: '\uD83D\uDE11',
    flatIcon: (
      <FaceMeh
        className="answer-icon mid"
        role="img"
        aria-label="middling"
        title="middling"
      />
    ),
  },
  {
    id: 'bad',
    label: 'Bad',
    icon: '\uD83D\uDE22',
    flatIcon: (
      <FaceSad
        className="answer-icon bad"
        role="img"
        aria-label="bad"
        title="bad"
      />
    ),
  },
];

export const ABSTAIN: AnswerDef = {
  id: 'skip',
  label: 'Abstain',
  icon: '\uD83D\uDE36',
  flatIcon: (
    <FaceBlank
      className="answer-icon skip"
      role="img"
      aria-label="unknown"
      title="unknown"
    />
  ),
};

export const ALL_ANSWERS: AnswerDef[] = [...ANSWERS, ABSTAIN];

const LOOKUP = new Map(ALL_ANSWERS.map((o) => [o.id, o]));

export const getAnswer = (id: AnswerID) => LOOKUP.get(id);
