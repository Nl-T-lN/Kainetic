"use client";

import { use } from "react";
import { ArtistView } from "@/components/ArtistView";
import styled from "styled-components";

const ViewContainer = styled.div`
  width: 100%;
`;

export default function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return (
    <ViewContainer>
      <ArtistView artistId={resolvedParams.id} />
    </ViewContainer>
  );
}
