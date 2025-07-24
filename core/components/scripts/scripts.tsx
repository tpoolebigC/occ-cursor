import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import Script from 'next/script';
import { ComponentProps } from 'react';

import { FragmentOf } from '~/client/graphql';

import { ScriptsFragment } from './fragment';

type ScriptsData = FragmentOf<typeof ScriptsFragment>;

interface ScriptRendererProps {
  scripts: ScriptsData['headerScripts'] | null;
  strategy: ComponentProps<typeof Script>['strategy'];
}

export const ScriptManagerScripts = ({ scripts, strategy }: ScriptRendererProps) => {
  try {
    if (!scripts?.edges) return null;

    const scriptNodes = removeEdgesAndNodes(scripts);

    if (!Array.isArray(scriptNodes) || scriptNodes.length === 0) {
      return null;
    }

    return (
      <>
        {scriptNodes
          .map((script) => {
            try {
              const scriptProps: ComponentProps<typeof Script> = {
                strategy,
              };

              // Handle external scripts (SrcScript)
              if (script?.__typename === 'SrcScript' && script.src) {
                scriptProps.src = script.src;

                // Add integrity hashes if provided
                if (script.integrityHashes?.length > 0) {
                  scriptProps.integrity = script.integrityHashes
                    .map((hashObj) => hashObj?.hash)
                    .filter(Boolean)
                    .join(' ');
                  scriptProps.crossOrigin = 'anonymous';
                }
              }

              // Handle inline scripts (InlineScript)
              if (script?.__typename === 'InlineScript' && script.scriptTag) {
                const scriptMatch = /<script[^>]*>([\s\S]*?)<\/script>/i.exec(script.scriptTag);

                if (scriptMatch?.[1]) {
                  scriptProps.dangerouslySetInnerHTML = {
                    __html: scriptMatch[1],
                  };
                }
              }

              scriptProps.id = `bc-script-${script?.entityId || Math.random()}`;

              // Return null for invalid scripts (will be filtered out)
              if (!scriptProps.src && !scriptProps.dangerouslySetInnerHTML) {
                return null;
              }

              return scriptProps;
            } catch (error) {
              console.warn('Error processing script:', error);
              return null;
            }
          })
          .filter((scriptProps): scriptProps is ComponentProps<typeof Script> => scriptProps !== null)
          .map((scriptProps) => {
            return <Script key={scriptProps.id} {...scriptProps} />;
          })}
      </>
    );
  } catch (error) {
    console.warn('Error in ScriptManagerScripts:', error);
    return null;
  }
};
