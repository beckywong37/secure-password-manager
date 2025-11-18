// GenAI Citation for April:
// Portions of this code was generated/refactored with the help of Cursor with the Claude-4.5-sonnet model
// The conversation in the file below documents the GenAI Interaction that led to my code.
// ../GenAI_transcripts/2025_11_15_Cursor_refactor_UI.md

import type { FC, ReactNode } from 'react';
import styles from './Spacer.module.css';

export type SpacingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface SpacerProps {
    children: ReactNode;
    
    // Margin props
    margin?: SpacingSize;
    marginTop?: SpacingSize;
    marginBottom?: SpacingSize;
    marginLeft?: SpacingSize;
    marginRight?: SpacingSize;
    marginX?: SpacingSize;
    marginY?: SpacingSize;
    
    // Padding props
    padding?: SpacingSize;
    paddingTop?: SpacingSize;
    paddingBottom?: SpacingSize;
    paddingLeft?: SpacingSize;
    paddingRight?: SpacingSize;
    paddingX?: SpacingSize;
    paddingY?: SpacingSize;
}

export const Spacer: FC<SpacerProps> = ({ 
    children,
    margin: m, marginTop: mt, marginBottom: mb, marginLeft: ml, marginRight: mr, marginX: mx, marginY: my,
    padding: p, paddingTop: pt, paddingBottom: pb, paddingLeft: pl, paddingRight: pr, paddingX: px, paddingY: py
}) => {
    const classes = [
        m && styles[`m-${m}`],
        mt && styles[`mt-${mt}`],
        mb && styles[`mb-${mb}`],
        ml && styles[`ml-${ml}`],
        mr && styles[`mr-${mr}`],
        mx && styles[`mx-${mx}`],
        my && styles[`my-${my}`],
        p && styles[`p-${p}`],
        pt && styles[`pt-${pt}`],
        pb && styles[`pb-${pb}`],
        pl && styles[`pl-${pl}`],
        pr && styles[`pr-${pr}`],
        px && styles[`px-${px}`],
        py && styles[`py-${py}`],
    ].filter(Boolean).join(' ');

    return <div className={classes}>{children}</div>;
};

