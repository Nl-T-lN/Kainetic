"use client";

import { use } from "react";
import { AlbumView } from "@/components/AlbumView";
import styled from "styled-components";

const ViewContainer = styled.div`
  width: 100%;
`;

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return (
    <ViewContainer>
      <AlbumView albumId={resolvedParams.id} />
    </ViewContainer>
  );
}
