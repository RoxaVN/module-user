import { Card, SimpleGrid, Image, Text } from '@mantine/core';
import { json } from '@remix-run/node';
import { useLoaderData, useOutletContext, Link } from '@remix-run/react';
import { moduleManager } from '@roxavn/core/server';
import { WebModule, useMetaTranslation } from '@roxavn/core/web';
import { useEffect } from 'react';

export default function () {
  const data = useLoaderData<typeof loader>();
  const { t } = useMetaTranslation();
  const { setWebModule } = useOutletContext<any>();

  useEffect(() => {
    setWebModule(undefined);
  }, []);

  return (
    <SimpleGrid
      cols={6}
      breakpoints={[
        { maxWidth: 1280, cols: 5, spacing: 'lg' },
        { maxWidth: 980, cols: 4, spacing: 'md' },
        { maxWidth: 755, cols: 3, spacing: 'sm' },
        { maxWidth: 600, cols: 2, spacing: 'sm' },
      ]}
    >
      {data.modules.map((m) => (
        <Card key={m.name}>
          <Card.Section>
            <Link to={m.path}>
              <Image
                src={WebModule.resolveStaticPath(m.name, '/icon.svg')}
                height={160}
                alt={m.name}
              />
            </Link>
          </Card.Section>
          <Text weight={500} mt="md" align="center">
            {t(m.name + '.name')}
          </Text>
        </Card>
      ))}
    </SimpleGrid>
  );
}

export async function loader() {
  return json({
    modules: await moduleManager.getModulesHaveAppPages(),
  });
}
