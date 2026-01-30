import { memo } from 'react';
import { Header } from '../common/Header';
import { Anchor } from '../common/Anchor';
import {
  moodFocus,
  Preview,
  typeItem,
  vote,
  type PreviewContent,
} from './Preview';

export const GuidancePage = memo(() => (
  <article className="page-guidance global-article">
    <Header
      documentTitle="Guidance - Refacto"
      title="Guidance"
      backLink={{ label: 'Home', action: '/' }}
    />
    <section>
      <Anchor tag="h2" name="what">
        <strong>What</strong> is a retro?
      </Anchor>
      <p>
        A retro (short for &ldquo;retrospective&rdquo;, roughly meaning
        &ldquo;looking back&rdquo;) is a regular team session where everybody
        gets a chance to reflect on their work and discuss what&rsquo;s going
        well, and what can be improved.
      </p>
    </section>
    <section>
      <Anchor tag="h2" name="why">
        <strong>Why</strong> run a retro?
      </Anchor>
      <p>
        Retros are used to identify small, iterative changes that can be made to
        a team&rsquo;s way of working to improve efficiency, capability, and
        morale. They encourage communication and help teams to deliver faster
        and more sustainably.
      </p>
    </section>
    <section>
      <Anchor tag="h2" name="who">
        <strong>Who</strong> are retros for?
      </Anchor>
      <p>
        Though most widely used by software teams, retros can be used by any
        team of people who want to improve their day-to-day processes. The only
        requirement is that the team (or at least some of the people involved in
        the retro) must be empowered to be able to make changes and experiment
        with their processes. Teams without autonomy will not benefit from
        running retros.
      </p>
    </section>
    <section>
      <Anchor tag="h2" name="when">
        <strong>When</strong> do retros happen?
      </Anchor>
      <p>
        Each team will find their own cadence for running retros, but they are
        typically held weekly or fortnightly, with sessions lasting 30 minutes
        to 1 hour, depending on how much the team has to discuss. Running a
        retro regularly as the last thing on a Friday can be a good way to
        &ldquo;book-end&rdquo; the week. Some teams run larger sessions once per
        quarter or after notable milestones to discuss wider trends. The cadence
        need not be set in stone, and an outcome of a retro may be to run more
        or less frequent retros in the future.
      </p>
    </section>
    <section>
      <Anchor tag="h2" name="where">
        <strong>Where</strong> do retros happen?
      </Anchor>
      <p>
        In-person retros can take place in any private area big enough for the
        whole team; typically a meeting room, ideally with a whiteboard which is
        accessible to everybody. If you don&rsquo;t have a whiteboard, have
        people write on note paper and arrange the notes on a table or stick
        them to a wall.
      </p>
      <p>
        If any or all team members are remote, online tools should be used
        instead. This requires a video call (such as Zoom, Google Meet, or
        Microsoft Teams), as well as a collaborative document which everybody
        can edit simultaneously (such as a Google Doc, a canvas, or a dedicated
        tool like Refacto).
      </p>
    </section>
    <section>
      <Anchor tag="h2" name="how">
        <strong>How</strong> is a retro run?
      </Anchor>
      <p>
        There are many different formats teams can use for running retros, but
        the core steps for a good retro are:
      </p>
      <ul>
        <li>
          <strong>Invite the whole team.</strong> For example in a software team
          this should include any engineers, designers, data scientists, product
          managers, subject-matter experts, etc. who are involved in the
          day-to-day work. Do <em>not</em> invite stakeholders such as managers,
          the CEO, or customers (even as observers), as this is likely to make
          people less willing to discuss problems.
        </li>
        <li>
          <strong>Establish a safe space for discussion.</strong>{' '}
          &ldquo;Psychological safety&rdquo; is an important part of a good a
          retro: participants need to know that issues they raise will be taken
          seriously and they will not be in trouble for raising them. When
          issues are discussed, it&rsquo;s important to focus on the problem and
          not any particular person (for example if somebody made a mistake, the
          questions should be around what could have caught or prevented that
          type of mistake). As in any other business setting: participants must
          be respectful and courteous to each other, even when they have
          disagreements. Everybody should have an equal opportunity to
          participate (the conversation must not be dominated by the
          &ldquo;loudest voice&rdquo;).
        </li>
        <li>
          <strong>Assign one person to facilitate.</strong> The facilitator will
          be responsible for keeping the session to time, which involves guiding
          the discussion and calling time on conversations which are not
          progressing, or go off-topic. The role is <em>not</em> to define the
          topics to be discussed: these come from the team as a whole. Good
          facilitators often end up saying less in a retro than the other
          participants. This role can (and should!) change each session, to give
          everybody a chance to facilitate.
        </li>
        <li>
          The method of deciding what to discuss depends on the type of retro
          and the intended outcomes. See below for some examples.
        </li>
        <li>
          <strong>Write actionable tasks.</strong> When problems are discussed,
          try to agree and write down one or more <em>actionable</em> tasks or
          experiments to help the situation which can be performed before the
          next retro. Assign each task to a specific person who is present in
          the session. Discuss the actions and any progress (or lack of
          progress) at the start of the next session.
        </li>
        <li>
          <strong>Do the actionable tasks.</strong> Between retros, it&rsquo;s
          important that the discussed actions are actually <em>done</em> (or at
          least attempted, if there turn out to be problems). Keep track of the
          agreed actions, and hold people accountable for the actions which were
          assigned to them.
        </li>
      </ul>
      <p>
        To help guide the conversation, lots of different types of retro have
        been developed, and most teams will adapt a few formats over time to fit
        their unique needs. Some of the more common retro formats are:
      </p>
      <ul>
        <li>
          <p>
            <strong>3-column.</strong>
          </p>
          <Preview content={MOOD_RETRO_PREVIEW} />
          <p>
            In a 3-column retro, there are 3 columns on the whiteboard and all
            participants spend the first 5&ndash;10 minutes writing down
            potential talking points and adding them to the appropriate column.
            The meaning of the columns can vary, but they are often along the
            lines of &ldquo;Happy&rdquo; (things which went well),
            &ldquo;Wondering&rdquo; (questions or suggestions), and
            &ldquo;Sad&ldquo; (things which went badly).
          </p>
          <p>
            In larger teams, participants will usually cast votes for the items
            they care about as a way of prioritising the discussion, since there
            may not be time to discuss everything. In very large teams, there
            may be a limit on the number of items each participant is allowed
            write on the board.
          </p>
          <p>
            This format is a good regular retro, since it requires very little
            setup, is easy to run, and adapts to anything the team may wish to
            discuss. It tends to focus on immediate concerns which are
            top-of-mind, rather than higher-level things. Note that participants
            who have very different roles or perspectives compared to the rest
            of the team can sometimes feel left out during these retros, because
            prioritisation comes from majority voting.
          </p>
          <p>Refacto supports 3-column retros.</p>
        </li>
        <li>
          <p>
            <strong>Timeline.</strong> A timeline retro begins with a horizontal
            timeline drawn on the whiteboard covering the time period to be
            discussed (typically spanning from the last timeline retro, which
            may be a few months earlier, to the current day). Key events are
            marked on this timeline before the session begins to act as memory
            prompts during the session. Participants begin by adding important
            events to the timeline which may have been missed, then each
            participant draws a &ldquo;mood line&rdquo; from left to right,
            showing how happy they felt at different times (happier as the line
            goes higher, less happy as it goes lower). Once all lines have been
            drawn, the facilitator prompts discussions by looking for patterns
            (such as several people&rsquo;s lines going higher or lower around
            the same time) or outliers.
          </p>
          <p>
            This format takes a bit of setup and does not work as a frequent
            retro, but is a good change of format to run every few months (e.g.
            once per quarter, or after large tracks of work finish). It focuses
            on long-term trends and big events rather than immediate concerns.
          </p>
        </li>
      </ul>
      <p>
        There are as many retro formats as there are teams, and it is good to
        experiment with a variety of options. Team members may have their own
        suggestions. Whichever format(s) you use, ensure you meet these
        criteria:
      </p>
      <ul className="narrow">
        <li>
          The outcome is a set of <strong>actionable tasks</strong>;
        </li>
        <li>
          All participants have an <strong>equal voice</strong>;
        </li>
        <li>
          Everybody <strong>feels safe</strong> in the discussions;
        </li>
        <li>
          The team <strong>enjoys</strong> and <strong>finds value</strong> in
          the session.
        </li>
      </ul>
    </section>
  </article>
));

const now = Date.now();
const MOOD_RETRO_PREVIEW: PreviewContent = {
  format: 'mood',
  simulatedTime: now,
  name: 'Step 1: Everybody adds items',

  frames: [
    ...typeItem(500, 'new-item-happy:value', {
      id: 'i0',
      category: 'happy',
      message: 'We can run retros remotely 😃',
      created: 0,
      attachment: null,
      votes: 0,
      doneTime: 0,
    }),
    ...typeItem(700, 'new-item-sad:value', {
      id: 'i2',
      category: 'sad',
      message: 'It rained',
      created: 2,
      attachment: null,
      votes: 0,
      doneTime: 0,
    }),
    {
      delay: 100,
      spec: {
        items: [
          'push',
          {
            id: 'i1',
            category: 'happy',
            message: 'Everything is awesome!',
            created: 1,
            attachment: null,
            votes: 0,
            doneTime: 0,
          },
        ],
      },
    },
    { delay: 200, spec: vote('i1') },
    {
      delay: 300,
      spec: {
        items: [
          'push',
          {
            id: 'i3',
            category: 'meh',
            message: 'other retro formats',
            created: 3,
            attachment: null,
            votes: 0,
            doneTime: 0,
          },
        ],
      },
    },
    { delay: 400, spec: vote('i1') },
    { delay: 200, spec: vote('i1') },
    { delay: 300, spec: vote('i1') },
    {
      delay: 100,
      spec: {
        items: [
          'push',
          {
            id: 'i4',
            category: 'sad',
            message: 'That thing happened',
            created: 4,
            attachment: {
              type: 'giphy',
              url: 'https://media3.giphy.com/media/Y4z9olnoVl5QI/200.gif',
            },
            votes: 0,
            doneTime: 0,
          },
        ],
      },
    },
    {
      delay: 1100,
      spec: {
        items: [
          'push',
          {
            id: 'i5',
            category: 'happy',
            message: 'That TV show',
            created: 5,
            attachment: null,
            votes: 0,
            doneTime: 0,
          },
        ],
      },
    },
    { delay: 200, spec: vote('i4') },
    { delay: 600, spec: vote('i1') },
    { delay: 300, spec: vote('i1') },
    { delay: 900, spec: vote('i1') },
    {
      delay: 2000,
      spec: { name: ['=', 'Step 2: Discuss the items…'] },
    },
    { delay: 1500, spec: moodFocus('', 'i4', now) },
    { delay: 3000, spec: moodFocus('i4', 'i1', now) },
    { delay: 4000, spec: moodFocus('i1', 'i2', now) },
    {
      delay: 2000,
      spec: { name: ['=', 'Step 2: Discuss the items… and record actions'] },
    },
    ...typeItem(700, 'new-action:value', {
      id: 'a0',
      category: 'action',
      message: 'Buy an umbrella ☂️ [Sam]',
      created: now,
      attachment: null,
      votes: 0,
      doneTime: 0,
    }),
    { delay: 1500, spec: moodFocus('i2', 'i3', now) },
    { delay: 500, spec: moodFocus('i3', 'i0', now) },
    { delay: 500, spec: moodFocus('i0', 'i5', now) },
    { delay: 500, spec: moodFocus('i5', '', now) },
    {
      delay: 2000,
      spec: { name: ['=', 'Step 3: Archive'] },
    },
    {
      delay: 1000,
      spec: { items: ['delete', ['all', { category: ['!=', 'action'] }]] },
      animation: 'archive',
    },
    {
      delay: 4000,
      spec: { name: ['=', 'Step 4: Tick actions when they are done'] },
    },
    {
      delay: 1000,
      spec: {
        items: [
          'update',
          ['first', { id: ['=', 'a0'] }],
          { doneTime: ['=', 1] },
        ],
      },
    },
  ],
};
