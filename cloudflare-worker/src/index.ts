export interface Env {
  GITHUB_TOKEN: string;
  GITHUB_REPO: string;
  SHARED_SECRET: string;
}

interface TeamsPayload {
  text?: string;
  user?: string;
  title?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    const providedSecret = request.headers.get('x-shared-secret');
    if (!providedSecret || providedSecret !== env.SHARED_SECRET) {
      return json({ error: 'Unauthorized' }, 401);
    }

    let payload: TeamsPayload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    const messageText = (payload.text ?? '').trim();
    if (!messageText) {
      return json({ error: 'Field "text" is required' }, 400);
    }

    const requester = payload.user?.trim() || 'Teamsユーザー';
    const title = payload.title?.trim() || truncate(messageText, 80);

    const issueBody = [
      '@claude',
      '',
      '以下のリクエストを実装してPRを作成してください。',
      '',
      `**依頼者:** ${requester}`,
      '**依頼内容:**',
      '',
      messageText,
    ].join('\n');

    const ghResponse = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/issues`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'life-general-election-teams-bridge',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `[Teams] ${title}`,
          body: issueBody,
          labels: ['from-teams'],
        }),
      },
    );

    if (!ghResponse.ok) {
      const errText = await ghResponse.text();
      return json(
        {
          error: 'GitHub API error',
          status: ghResponse.status,
          detail: errText.slice(0, 500),
        },
        502,
      );
    }

    const issue = (await ghResponse.json()) as { html_url: string; number: number };
    return json({
      ok: true,
      issue_url: issue.html_url,
      issue_number: issue.number,
    });
  },
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function truncate(input: string, max: number): string {
  return input.length <= max ? input : `${input.slice(0, max - 1)}…`;
}
